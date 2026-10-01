import { Result } from '@adrienlcp/result'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import { fetchDeputyRecord } from '@/features/deputies/deputies-api'
import { parseDeputyId } from '@/features/deputies/deputy'
import { fetchDirectory } from '@/features/deputies/directory-api'
import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
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

export const deputyLoader = ({
  deputyId,
  signal
}: {
  deputyId: string
  signal: AbortSignal
}) => ({
  identity: fetchIdentity({ deputyId, signal }),
  votes: fetchVoteLines({ deputyId, signal })
})

export const useDeputyData = () => useRouteData<typeof deputyLoader>()
