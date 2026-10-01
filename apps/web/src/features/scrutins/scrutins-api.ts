import { Result } from '@adrienlcp/result'

import {
  type ScrutinDetail,
  scrutinBlockOf,
  scrutinBlockSchema,
  scrutinIndexSchema
} from '@on-record/protocol/assembly/scrutin'
import { datasetPaths } from '@on-record/protocol/datasets'

import {
  createDatasetReader,
  type DatasetError
} from '@/infrastructure/api/datasets-api'

const readScrutinIndex = createDatasetReader(scrutinIndexSchema)
const readScrutinBlock = createDatasetReader(scrutinBlockSchema)

/**
 * Every scrutin of the legislature, summary only. Megabytes: only the pages
 * that list or join scrutins read it.
 */
export const fetchScrutinIndex = (signal: AbortSignal) =>
  readScrutinIndex({ path: datasetPaths.scrutinIndex, signal })

/** One scrutin in full, read from the block of a hundred that holds it. */
export const fetchScrutin = async ({
  scrutinNumber,
  signal
}: {
  scrutinNumber: number
  signal: AbortSignal
}): Promise<Result<ScrutinDetail, DatasetError>> => {
  const block = await readScrutinBlock({
    path: datasetPaths.scrutinBlock(scrutinBlockOf(scrutinNumber)),
    signal
  })

  if (block.status === 'failure') {
    return block
  }

  const scrutin = block.data.find(({ number }) => number === scrutinNumber)

  return scrutin === undefined
    ? Result.failure('missing')
    : Result.success(scrutin)
}

/** A scrutin number as the URL carries it, or `null` when it is not one. */
export const parseScrutinNumber = (text: string): number | null =>
  /^[1-9]\d*$/.test(text) ? Number(text) : null
