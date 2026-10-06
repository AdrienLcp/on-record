import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { datasetPaths } from '@on-record/protocol/datasets.ts'

import type { IngestError } from '@/domain/ingest-errors.ts'

export type DatasetName = keyof typeof datasetPaths

/** A dataset serialised for publication, already checked against its protocol schema. */
export type DatasetFile = {
  content: string
  dataset: DatasetName
  /** Relative to the datasets folder, as `datasetPaths` gives it. */
  path: string
}

/** A value checked against its protocol schema and serialised. */
export const encodeDataset = <Schema extends z.ZodType>({
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
