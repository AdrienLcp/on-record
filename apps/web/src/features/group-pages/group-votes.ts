import type { GroupScrutinVote } from '@on-record/protocol/assembly/group-record'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import {
  type KindFilter,
  parseKindFilter
} from '@/features/scrutins/scrutin-search'

/** One scrutin the group took part in, and how it voted. */
export type GroupVoteLine = {
  scrutin: ScrutinSummary
  vote: GroupScrutinVote
}

/** The group's scrutins joined with their summaries, newest first. */
export const groupVoteLines = ({
  scrutins,
  votes
}: {
  scrutins: readonly ScrutinSummary[]
  votes: readonly GroupScrutinVote[]
}): GroupVoteLine[] => {
  const scrutinByNumber = new Map(
    scrutins.map((scrutin) => [scrutin.number, scrutin])
  )

  return votes
    .flatMap((vote) => {
      const scrutin = scrutinByNumber.get(vote.scrutin)

      return scrutin === undefined ? [] : [{ scrutin, vote }]
    })
    .toSorted((first, second) => second.scrutin.number - first.scrutin.number)
}

/** A group's published position, or `none` when the Assemblée published none. */
export type GroupPosition = BallotPosition | 'none'

export const groupPositionOf = (vote: GroupScrutinVote): GroupPosition =>
  vote.position ?? 'none'

/** Diverging order, as in the vote bars: for, the grey middle, against, then the rest. */
export const GROUP_POSITIONS = [
  'for',
  'abstention',
  'against',
  'nonVoting',
  'none'
] as const satisfies readonly GroupPosition[]

export type PositionFilter = 'all' | GroupPosition

export const POSITION_FILTERS = [
  'all',
  ...GROUP_POSITIONS
] as const satisfies readonly PositionFilter[]

export const parsePositionFilter = (value: string | null): PositionFilter =>
  POSITION_FILTERS.find((filter) => filter === value) ?? 'all'

/**
 * The kind a group's list opens on: solemn votes, the ones people recognise,
 * rather than the thousands of amendments.
 */
export const DEFAULT_GROUP_KIND = 'solemn' satisfies KindFilter

export const parseGroupKindFilter = (value: string | null): KindFilter =>
  value === null ? DEFAULT_GROUP_KIND : parseKindFilter(value)

/** The kind as the URL writes it: the default leaves no parameter. */
export const groupKindSearchValue = (kind: KindFilter): string | undefined =>
  kind === DEFAULT_GROUP_KIND ? undefined : kind

export const filterGroupLines = ({
  filters,
  lines
}: {
  filters: { kind: KindFilter; position: PositionFilter }
  lines: readonly GroupVoteLine[]
}): GroupVoteLine[] =>
  lines.filter(
    (line) =>
      (filters.kind === 'all' || line.scrutin.kind === filters.kind) &&
      (filters.position === 'all' ||
        groupPositionOf(line.vote) === filters.position)
  )

/** Members of the group on that day with no recorded vote. */
export const withoutVoteCountOf = (
  vote: Pick<GroupScrutinVote, 'memberCount' | 'totals'>
): number =>
  Math.max(
    0,
    vote.memberCount -
      vote.totals.for -
      vote.totals.against -
      vote.totals.abstention -
      vote.totals.nonVoting
  )

/** How many solemn votes the group took each published position on. */
export const solemnPositionCountsOf = (
  lines: readonly GroupVoteLine[]
): { byPosition: Record<GroupPosition, number>; total: number } => {
  const solemn = lines.filter((line) => line.scrutin.kind === 'solemn')
  const countOf = (position: GroupPosition): number =>
    solemn.filter((line) => groupPositionOf(line.vote) === position).length

  return {
    byPosition: {
      abstention: countOf('abstention'),
      against: countOf('against'),
      for: countOf('for'),
      none: countOf('none'),
      nonVoting: countOf('nonVoting')
    },
    total: solemn.length
  }
}

/**
 * Motions of censure held while the group sat, and those more than half its
 * members voted. Only "for" is recorded on a censure, and the Assemblée
 * publishes "for" as the group's position as soon as one member votes it, so
 * the published position cannot tell a group that backed a motion from one
 * where a few members signed on.
 */
export const censureSupportOf = (
  lines: readonly GroupVoteLine[]
): { backedByMostMembers: number; motions: number } => {
  const motions = lines.filter((line) => line.scrutin.kind === 'censure')

  return {
    backedByMostMembers: motions.filter(
      ({ vote }) => vote.totals.for * 2 > vote.memberCount
    ).length,
    motions: motions.length
  }
}
