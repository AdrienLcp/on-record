import type { SenateGroupId } from '@on-record/protocol/senate/senate-ids'
import type { SenateScrutinSummary } from '@on-record/protocol/senate/senate-scrutin'
import type { Senator } from '@on-record/protocol/senate/senator'
import type { SenatorBallot } from '@on-record/protocol/senate/senator-record'

import type { KindFilter } from '@/features/scrutins/scrutin-search'
import { senateGroupIdOn } from '@/features/senators/senator'

/** One Senate scrutin and the senator's recorded ballot on it. */
export type SenatorVoteLine = {
  ballot: SenatorBallot
  /** The senator's group on the day of the vote. */
  groupId: SenateGroupId | null
  scrutin: SenateScrutinSummary
}

/**
 * Every ballot of the senator joined with its scrutin, in the record's order,
 * newest first. A ballot on a scrutin the Senate left out of its open data
 * has no title to show: it is left out too.
 */
export const senatorVoteLines = ({
  ballots,
  scrutins,
  senator
}: {
  ballots: readonly SenatorBallot[]
  scrutins: readonly SenateScrutinSummary[]
  senator: Senator
}): SenatorVoteLine[] => {
  const scrutinById = new Map(scrutins.map((scrutin) => [scrutin.id, scrutin]))

  return ballots.flatMap((ballot) => {
    const scrutin = scrutinById.get(ballot.scrutin)

    return scrutin === undefined
      ? []
      : [
          {
            ballot,
            groupId: senateGroupIdOn({ day: scrutin.date, senator }),
            scrutin
          }
        ]
  })
}

/**
 * Which of a senator's lines to show. No "without a recorded vote": in the
 * Senate a group may vote for all its members, so every senator has a ballot
 * on every scrutin and a ballot proves no presence.
 */
export const SENATOR_BALLOT_FILTERS = [
  'all',
  'withGroup',
  'againstGroup',
  'corrected',
  'delegated'
] as const

export type SenatorBallotFilter = (typeof SENATOR_BALLOT_FILTERS)[number]

export const parseSenatorBallotFilter = (
  value: string | null
): SenatorBallotFilter =>
  SENATOR_BALLOT_FILTERS.find((filter) => filter === value) ?? 'all'

/** The group had a majority, and the senator voted for, against, or abstained. */
const isComparableWithGroup = ({ ballot }: SenatorVoteLine): boolean =>
  ballot.groupPosition !== null && ballot.position !== 'nonVoting'

const BALLOT_FILTER_TESTS = {
  againstGroup: (line) =>
    isComparableWithGroup(line) &&
    line.ballot.position !== line.ballot.groupPosition,
  all: () => true,
  corrected: ({ ballot }) => ballot.correction !== null,
  delegated: ({ ballot }) => ballot.byDelegation,
  withGroup: (line) =>
    isComparableWithGroup(line) &&
    line.ballot.position === line.ballot.groupPosition
} satisfies Record<SenatorBallotFilter, (line: SenatorVoteLine) => boolean>

export const filterSenatorVoteLines = ({
  filters,
  lines
}: {
  filters: { ballot: SenatorBallotFilter; kind: KindFilter }
  lines: readonly SenatorVoteLine[]
}): SenatorVoteLine[] =>
  lines.filter(
    (line) =>
      (filters.kind === 'all' || line.scrutin.kind === filters.kind) &&
      BALLOT_FILTER_TESTS[filters.ballot](line)
  )
