import { Result } from '@adrienlcp/result'

import type { Group } from '@on-record/protocol/assembly/group'

import { fetchDirectory } from '@/features/deputies/directory-api'
import { parseGroupId } from '@/features/groups/group'
import { sittingMemberCounts } from '@/features/groups/group-members'
import { fetchGroupRecord } from '@/features/groups/groups-api'
import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

import { type GroupVoteLine, groupVoteLines } from './group-votes'

export type GroupIdentity = {
  group: Group
  /** Deputies sitting in it today; `null` for a dissolved group. */
  memberCount: number | null
}

const fetchIdentity = async ({
  groupId,
  signal
}: {
  groupId: string
  signal: AbortSignal
}): Promise<Result<GroupIdentity, DatasetError>> => {
  const directory = await fetchDirectory(signal)

  if (directory.status === 'failure') {
    return directory
  }

  const group = directory.data.groups.find(({ id }) => id === groupId)

  if (group === undefined) {
    return Result.failure('missing')
  }

  return Result.success({
    group,
    memberCount:
      group.to === null
        ? (sittingMemberCounts(directory.data.deputies).get(group.id) ?? 0)
        : null
  })
}

/** Slower than the identity: it reads the whole scrutin index. */
const fetchVoteLines = async ({
  groupId,
  signal
}: {
  groupId: string
  signal: AbortSignal
}): Promise<Result<GroupVoteLine[], DatasetError>> => {
  const officialId = parseGroupId(groupId)

  if (officialId === null) {
    return Result.failure('missing')
  }

  const [record, scrutins] = await Promise.all([
    fetchGroupRecord({ groupId: officialId, signal }),
    fetchScrutinIndex(signal)
  ])

  if (record.status === 'failure') {
    return record
  }

  if (scrutins.status === 'failure') {
    return scrutins
  }

  return Result.success(
    groupVoteLines({ scrutins: scrutins.data, votes: record.data.votes })
  )
}

export const groupLoader = ({
  groupId,
  signal
}: {
  groupId: string
  signal: AbortSignal
}) => ({
  identity: fetchIdentity({ groupId, signal }),
  votes: fetchVoteLines({ groupId, signal })
})

export const useGroupData = () => useRouteData<typeof groupLoader>()
