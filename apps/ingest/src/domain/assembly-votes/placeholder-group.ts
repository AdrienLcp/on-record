import { Result } from '@adrienlcp/result'

import type { GroupMembership } from '@on-record/protocol/assembly/deputy.ts'
import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids.ts'
import type {
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin.ts'

import type { AssemblyVotesError } from '@/domain/assembly-votes/assembly-votes-errors.ts'
import { groupAtDate } from '@/domain/assembly-votes/group-at-date.ts'

/** The id some scrutin files give a group in place of its real one. */
export const PLACEHOLDER_GROUP_ID = 'PO0'

type MembershipsById = ReadonlyMap<DeputyId, readonly GroupMembership[]>

const hasNoVote = (group: GroupVote): boolean =>
  group.ballots.length === 0 &&
  Object.values(group.totals).every((count) => count === 0)

const groupOfVoters = (
  group: GroupVote,
  scrutin: ScrutinDetail,
  membershipsById: MembershipsById
): OrganId | null => {
  const voterGroupIds = new Set(
    group.ballots.map((ballot) =>
      groupAtDate(membershipsById.get(ballot.deputyId) ?? [], scrutin.date)
    )
  )
  const [onlyGroupId, ...otherGroupIds] = voterGroupIds
  return onlyGroupId !== undefined && otherGroupIds.length === 0
    ? onlyGroupId
    : null
}

/**
 * Gives back their real id to the groups a scrutin lists as `PO0`: the group
 * every listed voter belonged to that day. A placeholder group with no voter
 * and no vote carries nothing and is left out; any other ambiguity fails.
 */
export const resolvePlaceholderGroups = (
  scrutin: ScrutinDetail,
  membershipsById: MembershipsById
): Result<ScrutinDetail, AssemblyVotesError> => {
  if (!scrutin.groups.some((group) => group.groupId === PLACEHOLDER_GROUP_ID)) {
    return Result.success(scrutin)
  }

  const groups: GroupVote[] = []
  for (const group of scrutin.groups) {
    if (group.groupId !== PLACEHOLDER_GROUP_ID) {
      groups.push(group)
      continue
    }
    if (hasNoVote(group)) continue
    const groupId = groupOfVoters(group, scrutin, membershipsById)
    if (groupId === null) {
      return Result.failure({
        code: 'unresolved_group',
        scrutin: scrutin.number
      })
    }
    groups.push({ ...group, groupId })
  }

  const groupIds = groups.map((group) => group.groupId)
  if (new Set(groupIds).size !== groupIds.length) {
    return Result.failure({ code: 'unresolved_group', scrutin: scrutin.number })
  }
  return Result.success({ ...scrutin, groups })
}
