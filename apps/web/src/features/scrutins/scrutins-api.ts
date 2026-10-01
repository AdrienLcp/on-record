import { Result } from '@adrienlcp/result'

import { highlightsSchema } from '@on-record/protocol/assembly/highlights'
import { majorVotesSchema } from '@on-record/protocol/assembly/major-votes'
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
const readHighlights = createDatasetReader(highlightsSchema)
const readMajorVotes = createDatasetReader(majorVotesSchema)

/**
 * Every scrutin of the legislature, summary only. Megabytes: only the pages
 * that list or join scrutins read it.
 */
export const fetchScrutinIndex = (signal: AbortSignal) =>
  readScrutinIndex({ path: datasetPaths.scrutinIndex, signal })

/** The latest solemn votes and motions of censure: a few kilobytes. */
export const fetchHighlights = (signal: AbortSignal) =>
  readHighlights({ path: datasetPaths.highlights, signal })

/** Every solemn vote and motion of censure, with each group's stance: about a hundred votes. */
export const fetchMajorVotes = (signal: AbortSignal) =>
  readMajorVotes({ path: datasetPaths.majorVotes, signal })

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
