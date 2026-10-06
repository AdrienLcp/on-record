import { Result } from '@adrienlcp/result'

import { datasetPaths } from '@on-record/protocol/datasets'
import {
  type SenateScrutinDetail,
  senateScrutinBlockSchema,
  senateScrutinIndexSchema
} from '@on-record/protocol/senate/senate-scrutin'
import {
  type SenateScrutinNumber,
  senateScrutinBlockOf
} from '@on-record/protocol/senate/senate-scrutin-number'

import {
  createDatasetReader,
  type DatasetError
} from '@/infrastructure/api/datasets-api'

const readSenateScrutinIndex = createDatasetReader(senateScrutinIndexSchema)
const readSenateScrutinBlock = createDatasetReader(senateScrutinBlockSchema)

/** Every covered Senate scrutin, summary only, and those the Senate left out. */
export const fetchSenateScrutinIndex = (signal: AbortSignal) =>
  readSenateScrutinIndex({ path: datasetPaths.senateScrutinIndex, signal })

/** One Senate scrutin in full, read from the block of a hundred that holds it. */
export const fetchSenateScrutin = async ({
  scrutin,
  signal
}: {
  scrutin: SenateScrutinNumber
  signal: AbortSignal
}): Promise<Result<SenateScrutinDetail, DatasetError>> => {
  const block = await readSenateScrutinBlock({
    path: datasetPaths.senateScrutinBlock(senateScrutinBlockOf(scrutin)),
    signal
  })

  if (block.status === 'failure') {
    return block
  }

  const detail = block.data.find(
    ({ number, session }) =>
      number === scrutin.number && session === scrutin.session
  )

  return detail === undefined
    ? Result.failure('missing')
    : Result.success(detail)
}
