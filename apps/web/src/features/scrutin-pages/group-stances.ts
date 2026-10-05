import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'
import type {
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'

import { dissentersOf, groupsBySize } from './scrutin-breakdown'

/** A group's published position, or `none` when the Assemblée published none. */
export type GroupStance = BallotPosition | 'none'

/** Diverging order, as in the vote bars: for, the grey middle, against, then the rest. */
export const GROUP_STANCES = [
  'for',
  'abstention',
  'against',
  'nonVoting',
  'none'
] as const satisfies readonly GroupStance[]

export const stanceOf = (groupVote: GroupVote): GroupStance =>
  groupVote.majorityPosition ?? 'none'

export type GroupStanceSection = {
  stance: GroupStance
  /** Largest group first. */
  groups: GroupVote[]
}

/** The groups filed under their published position; positions no group took are left out. */
export const groupStanceSectionsOf = (
  groups: readonly GroupVote[]
): GroupStanceSection[] =>
  GROUP_STANCES.map((stance) => ({
    groups: groupsBySize(groups).filter(
      (groupVote) => stanceOf(groupVote) === stance
    ),
    stance
  })).filter((section) => section.groups.length > 0)

/** Members whose recorded vote is the one this row counts: the group's position, or every vote cast when it published none. */
export const countedVotesOf = (groupVote: GroupVote): number => {
  const stance = stanceOf(groupVote)

  if (stance === 'none') {
    return (
      groupVote.totals.for +
      groupVote.totals.against +
      groupVote.totals.abstention
    )
  }

  return groupVote.totals[stance]
}

/** For a censure motion only "for" is recorded: the groups by how many of them voted it. */
export const groupsByCensureVotes = (
  groups: readonly GroupVote[]
): GroupVote[] =>
  groupsBySize(groups).toSorted(
    (first, second) => second.totals.for - first.totals.for
  )

/** The figures the summary sentence is built from: nothing in it is chosen or worded by hand. */
export type ScrutinDigest =
  | {
      kind: 'censure'
      /** Groups at least one member of which voted the censure. */
      censureGroupCount: number
    }
  | {
      kind: 'vote'
      groupCountByStance: Record<GroupStance, number>
      /** Members who voted otherwise than their group's published position. */
      dissenterCount: number
    }

/** The digest of the groups shown, so the sentence counts the rows under it. */
export const digestOf = ({
  groups,
  kind
}: {
  groups: readonly GroupVote[]
  kind: ScrutinDetail['kind']
}): ScrutinDigest => {
  if (kind === 'censure') {
    return {
      censureGroupCount: groups.filter((groupVote) => groupVote.totals.for > 0)
        .length,
      kind: 'censure'
    }
  }

  const groupCountOf = (stance: GroupStance): number =>
    groups.filter((groupVote) => stanceOf(groupVote) === stance).length

  return {
    dissenterCount: groups.reduce(
      (count, groupVote) => count + dissentersOf(groupVote).length,
      0
    ),
    groupCountByStance: {
      abstention: groupCountOf('abstention'),
      against: groupCountOf('against'),
      for: groupCountOf('for'),
      none: groupCountOf('none'),
      nonVoting: groupCountOf('nonVoting')
    },
    kind: 'vote'
  }
}
