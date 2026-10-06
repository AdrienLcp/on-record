import { Result } from '@adrienlcp/result'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import {
  type AmendmentLine,
  amendmentLinesOf
} from '@/features/amendments/amendment-search'
import {
  fetchDeputyAmendments,
  fetchLegislativeFileTitles
} from '@/features/amendments/amendments-api'
import { fetchDeputyRecord } from '@/features/deputies/deputies-api'
import { parseDeputyId } from '@/features/deputies/deputy'
import { fetchDirectory } from '@/features/deputies/directory-api'
import {
  fetchHatvpCardData,
  type HatvpCardData
} from '@/features/hatvp/hatvp-api'
import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

import { type DeputyVoteLine, deputyVoteLines } from './deputy-votes'

export type DeputyIdentity = {
  deputy: Deputy
  groups: Group[]
}

const fetchIdentity = async ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}): Promise<Result<DeputyIdentity, DatasetError>> => {
  const directory = await fetchDirectory(signal)

  if (directory.status === 'failure') {
    return directory
  }

  const deputy = directory.data.deputies.find(({ id }) => id === deputyId)

  return deputy === undefined
    ? Result.failure('missing')
    : Result.success({ deputy, groups: directory.data.groups })
}

/**
 * Every scrutin of the deputy's mandates joined with their ballots. Slower
 * than the identity: it reads the whole scrutin index.
 */
const fetchVoteLines = async ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}): Promise<Result<DeputyVoteLine[], DatasetError>> => {
  const officialId = parseDeputyId(deputyId)

  if (officialId === null) {
    return Result.failure('missing')
  }

  const [identity, record, scrutins] = await Promise.all([
    fetchIdentity({ deputyId, signal }),
    fetchDeputyRecord({ deputyId: officialId, signal }),
    fetchScrutinIndex(signal)
  ])

  if (identity.status === 'failure') {
    return identity
  }

  if (record.status === 'failure') {
    return record
  }

  if (scrutins.status === 'failure') {
    return scrutins
  }

  return Result.success(
    deputyVoteLines({
      ballots: record.data.ballots,
      deputy: identity.data.deputy,
      scrutins: scrutins.data
    })
  )
}

export type DeputyAmendmentRecord = {
  /** Amendments of others the deputy co-signed: a count, never a list. */
  cosignedCount: number
  /** Builds the official links of the amendments. */
  legislature: number
  lines: AmendmentLine[]
}

const fetchAmendmentRecord = async ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}): Promise<Result<DeputyAmendmentRecord, DatasetError>> => {
  const officialId = parseDeputyId(deputyId)

  if (officialId === null) {
    return Result.failure('missing')
  }

  const [amendments, fileTitles, meta] = await Promise.all([
    fetchDeputyAmendments({ deputyId: officialId, signal }),
    fetchLegislativeFileTitles(signal),
    fetchDatasetsMeta(signal)
  ])

  if (amendments.status === 'failure') {
    return amendments
  }

  if (fileTitles.status === 'failure') {
    return fileTitles
  }

  if (meta.status === 'failure') {
    return meta
  }

  return Result.success({
    cosignedCount: amendments.data.cosignedCount,
    legislature: meta.data.legislature,
    lines: amendmentLinesOf({
      amendments: amendments.data.amendments,
      fileTitles: fileTitles.data
    })
  })
}

const fetchHatvp = async ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}): Promise<Result<HatvpCardData, DatasetError>> => {
  const officialId = parseDeputyId(deputyId)

  if (officialId === null) {
    return Result.failure('missing')
  }

  return fetchHatvpCardData({
    signal,
    subject: { chamber: 'assembly', id: officialId }
  })
}

export const deputyLoader = ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}) => ({
  amendments: fetchAmendmentRecord({ deputyId, signal }),
  hatvp: fetchHatvp({ deputyId, signal }),
  identity: fetchIdentity({ deputyId, signal }),
  votes: fetchVoteLines({ deputyId, signal })
})

export const useDeputyData = () => useRouteData<typeof deputyLoader>()
