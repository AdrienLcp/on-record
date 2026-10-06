import { Result } from '@adrienlcp/result'

import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type { Senator } from '@on-record/protocol/senate/senator'

import { fetchSenateScrutinIndex } from '@/features/senate-scrutins/senate-scrutins-api'
import { parseSenatorId } from '@/features/senators/senator'
import {
  fetchSenateDirectory,
  fetchSenatorRecord
} from '@/features/senators/senators-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

import { type SenatorVoteLine, senatorVoteLines } from './senator-votes'

export type SenatorIdentity = {
  groups: SenateGroup[]
  senator: Senator
}

const fetchIdentity = async ({
  senatorId,
  signal
}: {
  senatorId: string
  signal: AbortSignal
}): Promise<Result<SenatorIdentity, DatasetError>> => {
  const directory = await fetchSenateDirectory(signal)

  if (directory.status === 'failure') {
    return directory
  }

  const senator = directory.data.senators.find(({ id }) => id === senatorId)

  return senator === undefined
    ? Result.failure('missing')
    : Result.success({ groups: directory.data.groups, senator })
}

/** The senator's ballots joined with their scrutins: it reads the whole index. */
const fetchVoteLines = async ({
  senatorId,
  signal
}: {
  senatorId: string
  signal: AbortSignal
}): Promise<Result<SenatorVoteLine[], DatasetError>> => {
  const officialId = parseSenatorId(senatorId)

  if (officialId === null) {
    return Result.failure('missing')
  }

  const [identity, record, index] = await Promise.all([
    fetchIdentity({ senatorId, signal }),
    fetchSenatorRecord({ senatorId: officialId, signal }),
    fetchSenateScrutinIndex(signal)
  ])

  if (identity.status === 'failure') {
    return identity
  }

  if (record.status === 'failure') {
    return record
  }

  if (index.status === 'failure') {
    return index
  }

  return Result.success(
    senatorVoteLines({
      ballots: record.data.ballots,
      scrutins: index.data.scrutins,
      senator: identity.data.senator
    })
  )
}

export const senatorLoader = ({
  senatorId,
  signal
}: {
  senatorId: string
  signal: AbortSignal
}) => ({
  identity: fetchIdentity({ senatorId, signal }),
  votes: fetchVoteLines({ senatorId, signal })
})

export const useSenatorData = () => useRouteData<typeof senatorLoader>()
