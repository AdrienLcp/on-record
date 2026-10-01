import { Result } from '@adrienlcp/result'

import type { Group } from '@on-record/protocol/assembly/group'
import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { fetchGroups } from '@/features/groups/groups-api'
import { fetchMajorVotes } from '@/features/scrutins/scrutins-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export type Comparison = {
  groups: Group[]
  votes: MajorVote[]
}

const fetchComparison = async (
  signal: AbortSignal
): Promise<Result<Comparison, DatasetError>> => {
  const [groups, votes] = await Promise.all([
    fetchGroups(signal),
    fetchMajorVotes(signal)
  ])

  if (groups.status === 'failure') {
    return groups
  }

  if (votes.status === 'failure') {
    return votes
  }

  return Result.success({ groups: groups.data, votes: votes.data })
}

export const compareLoader = ({ signal }: { signal: AbortSignal }) => ({
  comparison: fetchComparison(signal)
})

export const useCompareData = () => useRouteData<typeof compareLoader>()
