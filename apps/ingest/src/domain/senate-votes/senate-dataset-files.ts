import type { Result } from '@adrienlcp/result'

import { datasetPaths } from '@on-record/protocol/datasets.ts'
import { senateGroupsSchema } from '@on-record/protocol/senate/senate-group.ts'
import {
  type SenateScrutinDetail,
  senateScrutinBlockSchema,
  senateScrutinIndexSchema
} from '@on-record/protocol/senate/senate-scrutin.ts'
import { senateScrutinBlockOf } from '@on-record/protocol/senate/senate-scrutin-number.ts'
import { senatorsSchema } from '@on-record/protocol/senate/senator.ts'
import { senatorRecordSchema } from '@on-record/protocol/senate/senator-record.ts'

import { type DatasetFile, encodeDataset } from '@/domain/dataset-file.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type { SenateDatasets } from '@/domain/senate-votes/senate-datasets.ts'

const toBlocks = (
  scrutins: readonly SenateScrutinDetail[]
): ReadonlyMap<string, SenateScrutinDetail[]> => {
  const blocks = new Map<string, SenateScrutinDetail[]>()
  for (const scrutin of scrutins) {
    const block = senateScrutinBlockOf(scrutin)
    blocks.set(block, [...(blocks.get(block) ?? []), scrutin])
  }
  return blocks
}

const toSummary = ({
  corrections: _corrections,
  groups: _groups,
  ...summary
}: SenateScrutinDetail) => summary

/** Every Senate file to publish, each checked against its protocol schema. */
export const toSenateDatasetFiles = (
  senate: SenateDatasets
): Result<DatasetFile, IngestError>[] => [
  encodeDataset({
    dataset: 'senators',
    path: datasetPaths.senators,
    schema: senatorsSchema,
    value: senate.senators
  }),
  encodeDataset({
    dataset: 'senateGroups',
    path: datasetPaths.senateGroups,
    schema: senateGroupsSchema,
    value: senate.groups
  }),
  encodeDataset({
    dataset: 'senateScrutinIndex',
    path: datasetPaths.senateScrutinIndex,
    schema: senateScrutinIndexSchema,
    value: { missing: senate.missing, scrutins: senate.scrutins.map(toSummary) }
  }),
  ...[...toBlocks(senate.scrutins)].map(([block, scrutins]) =>
    encodeDataset({
      dataset: 'senateScrutinBlock',
      path: datasetPaths.senateScrutinBlock(block),
      schema: senateScrutinBlockSchema,
      value: scrutins
    })
  ),
  ...senate.senatorRecords.map((record) =>
    encodeDataset({
      dataset: 'senatorRecord',
      path: datasetPaths.senatorRecord(record.senatorId),
      schema: senatorRecordSchema,
      value: record
    })
  )
]
