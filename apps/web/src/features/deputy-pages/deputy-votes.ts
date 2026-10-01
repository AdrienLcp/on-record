import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { RecordedBallot } from '@on-record/protocol/assembly/deputy-record'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { groupIdOn, isSeatedOn } from '@/features/deputies/deputy'
import type { KindFilter } from '@/features/scrutins/scrutin-search'

/** One scrutin held while the deputy sat, and what the record holds for them. */
export type DeputyVoteLine = {
  /** `null` when no vote of the deputy is recorded on that scrutin. */
  ballot: RecordedBallot | null
  /** The deputy's group on the day of the vote. */
  groupId: OrganId | null
  scrutin: ScrutinSummary
}

/**
 * Every scrutin held during the deputy's mandates, newest first, joined with
 * their ballot when there is one: a missing ballot is a line too, so the
 * participation figure can list what it counts.
 */
export const deputyVoteLines = ({
  ballots,
  deputy,
  scrutins
}: {
  ballots: readonly RecordedBallot[]
  deputy: Deputy
  scrutins: readonly ScrutinSummary[]
}): DeputyVoteLine[] => {
  const ballotByScrutin = new Map(
    ballots.map((ballot) => [ballot.scrutin, ballot])
  )

  return scrutins
    .filter(
      (scrutin) =>
        ballotByScrutin.has(scrutin.number) ||
        isSeatedOn({ day: scrutin.date, deputy })
    )
    .toSorted((first, second) => second.number - first.number)
    .map((scrutin) => ({
      ballot: ballotByScrutin.get(scrutin.number) ?? null,
      groupId: groupIdOn({ day: scrutin.date, deputy }),
      scrutin
    }))
}

/**
 * Which of a deputy's lines to show; each figure on the page opens the list
 * on the filter that holds exactly the lines it counts.
 */
export const BALLOT_FILTERS = [
  'all',
  'recorded',
  'notRecorded',
  'withGroup',
  'againstGroup',
  'corrected',
  'delegated'
] as const

export type BallotFilter = (typeof BALLOT_FILTERS)[number]

export const parseBallotFilter = (value: string | null): BallotFilter =>
  BALLOT_FILTERS.find((filter) => filter === value) ?? 'all'

/**
 * A ballot that can be set against the group: the group had a majority, and
 * the deputy voted for, against, or abstained. A non-voting deputy (presiding
 * the sitting, a member of the government) neither agrees nor differs.
 */
const isComparableWithGroup = (
  ballot: RecordedBallot | null
): ballot is RecordedBallot & {
  groupPosition: NonNullable<RecordedBallot['groupPosition']>
} =>
  ballot !== null &&
  ballot.groupPosition !== null &&
  ballot.position !== 'nonVoting'

const BALLOT_FILTER_TESTS = {
  againstGroup: ({ ballot }) =>
    isComparableWithGroup(ballot) && ballot.position !== ballot.groupPosition,
  all: () => true,
  corrected: ({ ballot }) => ballot !== null && ballot.correction !== null,
  delegated: ({ ballot }) => ballot?.byDelegation === true,
  notRecorded: ({ ballot }) => ballot === null,
  recorded: ({ ballot }) => ballot !== null,
  withGroup: ({ ballot }) =>
    isComparableWithGroup(ballot) && ballot.position === ballot.groupPosition
} satisfies Record<BallotFilter, (line: DeputyVoteLine) => boolean>

export const filterVoteLines = ({
  filters,
  lines
}: {
  filters: { ballot: BallotFilter; kind: KindFilter }
  lines: readonly DeputyVoteLine[]
}): DeputyVoteLine[] =>
  lines.filter(
    (line) =>
      (filters.kind === 'all' || line.scrutin.kind === filters.kind) &&
      BALLOT_FILTER_TESTS[filters.ballot](line)
  )

const countOf = (
  lines: readonly DeputyVoteLine[],
  filter: BallotFilter
): number => lines.filter(BALLOT_FILTER_TESTS[filter]).length

/** Scrutins with a recorded vote, out of those held while the deputy sat. */
export const participationOf = (
  lines: readonly DeputyVoteLine[]
): { notRecorded: number; recorded: number; total: number } => ({
  notRecorded: countOf(lines, 'notRecorded'),
  recorded: countOf(lines, 'recorded'),
  total: lines.length
})

/** Ballots matching the group's majority, out of those that can be compared. */
export const agreementOf = (
  lines: readonly DeputyVoteLine[]
): { comparable: number; differing: number; matching: number } => {
  const matching = countOf(lines, 'withGroup')
  const differing = countOf(lines, 'againstGroup')

  return { comparable: matching + differing, differing, matching }
}
