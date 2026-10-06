import type { Result } from '@adrienlcp/result'

import { datasetPaths } from '@on-record/protocol/datasets.ts'
import { hatvpRecordSchema } from '@on-record/protocol/hatvp/hatvp-record.ts'

import { type DatasetFile, encodeDataset } from '@/domain/dataset-file.ts'
import type { HatvpDatasets } from '@/domain/hatvp/hatvp-datasets.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

/** One HATVP file per deputy and per senator, each checked against the protocol schema. */
export const toHatvpDatasetFiles = (
  hatvp: HatvpDatasets
): Result<DatasetFile, IngestError>[] => [
  ...hatvp.deputyRecords.map(({ deputyId, record }) =>
    encodeDataset({
      dataset: 'deputyHatvp',
      path: datasetPaths.deputyHatvp(deputyId),
      schema: hatvpRecordSchema,
      value: record
    })
  ),
  ...hatvp.senatorRecords.map(({ record, senatorId }) =>
    encodeDataset({
      dataset: 'senatorHatvp',
      path: datasetPaths.senatorHatvp(senatorId),
      schema: hatvpRecordSchema,
      value: record
    })
  )
]
