import { Result } from '@adrienlcp/result'

import type {
  GroupRecord,
  GroupScrutinVote
} from '@on-record/protocol/assembly/group-record.ts'
import type { OrganId } from '@on-record/protocol/assembly/official-ids.ts'
import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import type { IngestError } from '@/domain/ingest-errors.ts'

/**
 * Every group's own record, newest scrutin first: its published position,
 * member count and totals on each scrutin it was listed in. A group never
 * listed gets an empty record, so every group page has its file.
 */
export const toGroupRecords = ({
  groupIds,
  scrutins
}: {
  groupIds: readonly OrganId[]
  scrutins: readonly ScrutinDetail[]
}): Result<GroupRecord[], IngestError> => {
  const votesByGroup = new Map<OrganId, GroupScrutinVote[]>(
    groupIds.map((groupId) => [groupId, []])
  )
  const newestFirst = scrutins.toSorted(
    (left, right) => right.number - left.number
  )

  for (const scrutin of newestFirst) {
    for (const group of scrutin.groups) {
      const groupVotes = votesByGroup.get(group.groupId)
      if (groupVotes === undefined) {
        return Result.failure({ code: 'unknown_group', groupId: group.groupId })
      }
      groupVotes.push({
        memberCount: group.memberCount,
        position: group.majorityPosition,
        scrutin: scrutin.number,
        totals: group.totals
      })
    }
  }

  return Result.success(
    [...votesByGroup].map(([groupId, votes]) => ({ groupId, votes }))
  )
}
