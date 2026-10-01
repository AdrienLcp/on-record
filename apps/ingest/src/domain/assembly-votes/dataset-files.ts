import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import { communeIndexSchema } from '@on-record/protocol/assembly/commune.ts'
import { constituencyContoursSchema } from '@on-record/protocol/assembly/constituency-contour.ts'
import { deputiesSchema } from '@on-record/protocol/assembly/deputy.ts'
import { deputyRecordSchema } from '@on-record/protocol/assembly/deputy-record.ts'
import { groupsSchema } from '@on-record/protocol/assembly/group.ts'
import { groupRecordSchema } from '@on-record/protocol/assembly/group-record.ts'
import { highlightsSchema } from '@on-record/protocol/assembly/highlights.ts'
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

import type { AssemblyDatasets } from '@/domain/assembly-votes/assembly-datasets.ts'
import { toHighlights } from '@/domain/assembly-votes/highlights.ts'
import { toScrutinSummary } from '@/domain/assembly-votes/scrutin-detail.ts'
import type { ConstituencyDatasets } from '@/domain/constituencies/constituency-datasets.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

export type DatasetName = keyof typeof datasetPaths

/** A dataset serialised for publication, already checked against its protocol schema. */
export type DatasetFile = {
  content: string
  dataset: DatasetName
  /** Relative to the datasets folder, as `datasetPaths` gives it. */
  path: string
}

const encodeDataset = <Schema extends z.ZodType>({
  dataset,
  path,
  schema,
  value
}: {
  dataset: DatasetName
  path: string
  schema: Schema
  value: unknown
}): Result<DatasetFile, IngestError> => {
  const checked = schema.safeParse(value)
  if (!checked.success) {
    return Result.failure({
      code: 'invalid_dataset',
      issues: z.prettifyError(checked.error),
      path
    })
  }
  return Result.success({
    content: JSON.stringify(checked.data),
    dataset,
    path
  })
}

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
  assembly,
  constituencies,
  meta
}: {
  assembly: AssemblyDatasets
  constituencies: ConstituencyDatasets
  meta: DatasetsMeta
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
  const sizes = new Map<DatasetName, DatasetSize>()
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
