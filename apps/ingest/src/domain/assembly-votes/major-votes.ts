import type { MajorVote } from '@on-record/protocol/assembly/major-votes.ts'
import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import { toScrutinSummary } from '@/domain/assembly-votes/scrutin-detail.ts'

/** Every solemn vote and motion of censure, newest first, each group's stance without ballots. */
export const toMajorVotes = (scrutins: readonly ScrutinDetail[]): MajorVote[] =>
  scrutins
    .filter((scrutin) => scrutin.kind !== 'ordinary')
    .toSorted((left, right) => right.number - left.number)
    .map((scrutin) => ({
      ...toScrutinSummary(scrutin),
      groups: scrutin.groups.map((group) => ({
        groupId: group.groupId,
        memberCount: group.memberCount,
        position: group.majorityPosition,
        totals: group.totals
      }))
    }))
