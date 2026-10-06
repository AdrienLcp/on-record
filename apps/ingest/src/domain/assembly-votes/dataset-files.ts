import { Result } from '@adrienlcp/result'

import {
  deputyAmendmentsSchema,
  legislativeFileTitlesSchema
} from '@on-record/protocol/assembly/amendment.ts'
import { communeIndexSchema } from '@on-record/protocol/assembly/commune.ts'
import { constituencyContoursSchema } from '@on-record/protocol/assembly/constituency-contour.ts'
import { deputiesSchema } from '@on-record/protocol/assembly/deputy.ts'
import { deputyRecordSchema } from '@on-record/protocol/assembly/deputy-record.ts'
import { groupsSchema } from '@on-record/protocol/assembly/group.ts'
import { groupRecordSchema } from '@on-record/protocol/assembly/group-record.ts'
import { highlightsSchema } from '@on-record/protocol/assembly/highlights.ts'
import { majorVotesSchema } from '@on-record/protocol/assembly/major-votes.ts'
import {
  type ScrutinDetail,
  scrutinBlockOf,
  scrutinBlockSchema,
  scrutinIndexSchema
} from '@on-record/protocol/assembly/scrutin.ts'
import {
  type DatasetsMeta,
  datasetPaths,
  datasetsMetaSchema
} from '@on-record/protocol/datasets.ts'
import { MAX_PUBLISHED_FILES } from '@on-record/protocol/deploy-budget.ts'

import type { AmendmentDatasets } from '@/domain/assembly-amendments/amendment-datasets.ts'
import type { AssemblyDatasets } from '@/domain/assembly-votes/assembly-datasets.ts'
import { toHighlights } from '@/domain/assembly-votes/highlights.ts'
import { toMajorVotes } from '@/domain/assembly-votes/major-votes.ts'
import { toScrutinSummary } from '@/domain/assembly-votes/scrutin-detail.ts'
import type { ConstituencyDatasets } from '@/domain/constituencies/constituency-datasets.ts'
import { type DatasetFile, encodeDataset } from '@/domain/dataset-file.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import { toSenateDatasetFiles } from '@/domain/senate-votes/senate-dataset-files.ts'
import type { SenateDatasets } from '@/domain/senate-votes/senate-datasets.ts'

const toScrutinBlocks = (
  scrutins: readonly ScrutinDetail[]
): ReadonlyMap<number, ScrutinDetail[]> =>
  scrutins.reduce((blocks, scrutin) => {
    const block = scrutinBlockOf(scrutin.number)
    return blocks.set(block, [...(blocks.get(block) ?? []), scrutin])
  }, new Map<number, ScrutinDetail[]>())

/**
 * Every file to publish, each validated through its protocol schema. Fails
 * when the count would come near the host's limit.
 */
export const toDatasetFiles = ({
  amendments,
  assembly,
  constituencies,
  meta,
  senate
}: {
  amendments: AmendmentDatasets
  assembly: AssemblyDatasets
  constituencies: ConstituencyDatasets
  meta: DatasetsMeta
  senate: SenateDatasets
}): Result<DatasetFile[], IngestError> => {
  const scrutinSummaries = assembly.scrutins.map(toScrutinSummary)
  const encodings = [
    encodeDataset({
      dataset: 'deputies',
      path: datasetPaths.deputies,
      schema: deputiesSchema,
      value: assembly.deputies
    }),
    encodeDataset({
      dataset: 'groups',
      path: datasetPaths.groups,
      schema: groupsSchema,
      value: assembly.groups
    }),
    encodeDataset({
      dataset: 'scrutinIndex',
      path: datasetPaths.scrutinIndex,
      schema: scrutinIndexSchema,
      value: scrutinSummaries
    }),
    encodeDataset({
      dataset: 'highlights',
      path: datasetPaths.highlights,
      schema: highlightsSchema,
      value: toHighlights(scrutinSummaries)
    }),
    encodeDataset({
      dataset: 'majorVotes',
      path: datasetPaths.majorVotes,
      schema: majorVotesSchema,
      value: toMajorVotes(assembly.scrutins)
    }),
    encodeDataset({
      dataset: 'communes',
      path: datasetPaths.communes,
      schema: communeIndexSchema,
      value: constituencies.communes
    }),
    ...constituencies.contours.map((contours) =>
      encodeDataset({
        dataset: 'constituencyContours',
        path: datasetPaths.constituencyContours(contours.department),
        schema: constituencyContoursSchema,
        value: contours
      })
    ),
    ...[...toScrutinBlocks(assembly.scrutins)].map(([block, scrutins]) =>
      encodeDataset({
        dataset: 'scrutinBlock',
        path: datasetPaths.scrutinBlock(block),
        schema: scrutinBlockSchema,
        value: scrutins
      })
    ),
    ...assembly.deputyRecords.map((record) =>
      encodeDataset({
        dataset: 'deputyRecord',
        path: datasetPaths.deputyRecord(record.deputyId),
        schema: deputyRecordSchema,
        value: record
      })
    ),
    ...assembly.groupRecords.map((record) =>
      encodeDataset({
        dataset: 'groupRecord',
        path: datasetPaths.groupRecord(record.groupId),
        schema: groupRecordSchema,
        value: record
      })
    ),
    encodeDataset({
      dataset: 'legislativeFileTitles',
      path: datasetPaths.legislativeFileTitles,
      schema: legislativeFileTitlesSchema,
      value: amendments.legislativeFileTitles
    }),
    ...amendments.deputyAmendments.map((record) =>
      encodeDataset({
        dataset: 'deputyAmendments',
        path: datasetPaths.deputyAmendments(record.deputyId),
        schema: deputyAmendmentsSchema,
        value: record
      })
    ),
    ...toSenateDatasetFiles(senate),
    encodeDataset({
      dataset: 'meta',
      path: datasetPaths.meta,
      schema: datasetsMetaSchema,
      value: meta
    })
  ]

  const files: DatasetFile[] = []
  for (const encoding of encodings) {
    if (encoding.status === 'failure') return encoding
    files.push(encoding.data)
  }
  if (files.length > MAX_PUBLISHED_FILES) {
    return Result.failure({
      code: 'too_many_files',
      count: files.length,
      limit: MAX_PUBLISHED_FILES
    })
  }
  return Result.success(files)
}

type DatasetSize = { bytes: number; files: number; largestBytes: number }

const byteLength = (content: string): number =>
  new TextEncoder().encode(content).byteLength

/** Bytes and file count per dataset, for the run log. */
export const measureDatasetFiles = (files: readonly DatasetFile[]) => {
  const sizes = new Map<DatasetFile['dataset'], DatasetSize>()
  for (const file of files) {
    const bytes = byteLength(file.content)
    const size = sizes.get(file.dataset) ?? {
      bytes: 0,
      files: 0,
      largestBytes: 0
    }
    sizes.set(file.dataset, {
      bytes: size.bytes + bytes,
      files: size.files + 1,
      largestBytes: Math.max(size.largestBytes, bytes)
    })
  }
  return {
    datasets: Object.fromEntries(sizes),
    fileCount: files.length,
    totalBytes: [...sizes.values()].reduce(
      (total, size) => total + size.bytes,
      0
    )
  }
}
