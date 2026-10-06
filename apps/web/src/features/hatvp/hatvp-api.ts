import { Result } from '@adrienlcp/result'

import type { DeputyId } from '@on-record/protocol/assembly/official-ids'
import { datasetPaths } from '@on-record/protocol/datasets'
import {
  type HatvpRecord,
  hatvpRecordSchema
} from '@on-record/protocol/hatvp/hatvp-record'
import { HATVP_SOURCE_ID } from '@on-record/protocol/hatvp/hatvp-source'
import type { SenatorId } from '@on-record/protocol/senate/senate-ids'

import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import {
  createDatasetReader,
  type DatasetError
} from '@/infrastructure/api/datasets-api'

const readHatvpRecord = createDatasetReader(hatvpRecordSchema)

/** Who the record is about: one file per deputy and per senator. */
export type HatvpSubject =
  | { chamber: 'assembly'; id: DeputyId }
  | { chamber: 'senate'; id: SenatorId }

export type HatvpCardData = {
  record: HatvpRecord
  /** The HATVP list's own `Last-Modified`, for the source line. */
  sourceDate: string | null
}

const pathOf = (subject: HatvpSubject): string =>
  subject.chamber === 'assembly'
    ? datasetPaths.deputyHatvp(subject.id)
    : datasetPaths.senatorHatvp(subject.id)

/** What the HATVP publishes about one parliamentarian, with the date of the list it comes from. */
export const fetchHatvpCardData = async ({
  signal,
  subject
}: {
  signal: AbortSignal
  subject: HatvpSubject
}): Promise<Result<HatvpCardData, DatasetError>> => {
  const [record, meta] = await Promise.all([
    readHatvpRecord({ path: pathOf(subject), signal }),
    fetchDatasetsMeta(signal)
  ])

  if (record.status === 'failure') {
    return record
  }

  if (meta.status === 'failure') {
    return meta
  }

  const source = meta.data.sources.find(({ id }) => id === HATVP_SOURCE_ID)

  return Result.success({
    record: record.data,
    sourceDate: source?.lastModified ?? null
  })
}
