import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'
import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids'
import type {
  Ballot,
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'

import { matchesQuery } from '@/helpers/search-text'

/**
 * The members who voted otherwise than their group's majority: for, against
 * or abstaining. A non-voting member did not vote otherwise, and a group with
 * no majority has no one to dissent from.
 */
export const dissentersOf = (groupVote: GroupVote): Ballot[] =>
  groupVote.majorityPosition === null
    ? []
    : groupVote.ballots.filter(
        (ballot) =>
          ballot.position !== 'nonVoting' &&
          ballot.position !== groupVote.majorityPosition
      )

/** Members of the group on that day with no recorded vote. */
export const withoutVoteCountOf = (groupVote: GroupVote): number =>
  Math.max(0, groupVote.memberCount - groupVote.ballots.length)

/** The id of a group's entry in the breakdown, so a summary row can lead to it. */
export const groupAnchorOf = (groupId: OrganId): string => `group-${groupId}`

export const groupsBySize = (groups: readonly GroupVote[]): GroupVote[] =>
  groups.toSorted((first, second) => second.memberCount - first.memberCount)

/** One deputy's line in the nominal list. */
export type NominalLine = {
  ballot: Ballot
  /** What the deputy declared afterwards, if they did. */
  correction: BallotPosition | null
  /** Their group on the day of the vote. */
  groupId: OrganId
  /** `null` for an id the deputies dataset does not know. */
  deputy: Deputy | null
}

/** Everyone with a recorded vote, by last name. */
export const nominalLinesOf = ({
  deputiesById,
  scrutin
}: {
  deputiesById: ReadonlyMap<DeputyId, Deputy>
  scrutin: ScrutinDetail
}): NominalLine[] => {
  const correctionByDeputy = new Map(
    scrutin.corrections.map((correction) => [
      correction.deputyId,
      correction.intended
    ])
  )

  return scrutin.groups
    .flatMap((groupVote) =>
      groupVote.ballots.map((ballot) => ({
        ballot,
        correction: correctionByDeputy.get(ballot.deputyId) ?? null,
        deputy: deputiesById.get(ballot.deputyId) ?? null,
        groupId: groupVote.groupId
      }))
    )
    .toSorted((first, second) =>
      sortableName(first).localeCompare(sortableName(second), 'fr')
    )
}

const sortableName = (line: NominalLine): string =>
  line.deputy === null
    ? line.ballot.deputyId
    : `${line.deputy.lastName} ${line.deputy.firstName}`

export type NominalPositionFilter = 'all' | BallotPosition

export const NOMINAL_POSITION_FILTERS = [
  'all',
  'for',
  'against',
  'abstention',
  'nonVoting'
] as const satisfies readonly NominalPositionFilter[]

export const filterNominalLines = ({
  lines,
  position,
  query
}: {
  lines: readonly NominalLine[]
  position: NominalPositionFilter
  query: string
}): NominalLine[] =>
  lines.filter(
    (line) =>
      (position === 'all' || line.ballot.position === position) &&
      matchesQuery({
        query,
        text:
          line.deputy === null
            ? line.ballot.deputyId
            : `${line.deputy.firstName} ${line.deputy.lastName}`
      })
  )
