import { compareFrench } from '@on-record/protocol/french-order'
import type {
  SenateGroupId,
  SenatorId
} from '@on-record/protocol/senate/senate-ids'
import type {
  SenateBallot,
  SenateScrutinDetail
} from '@on-record/protocol/senate/senate-scrutin'
import type { Senator } from '@on-record/protocol/senate/senator'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import type { NominalPositionFilter } from '@/features/scrutins/nominal-position-filter'
import { senatorFullNameOf } from '@/features/senators/senator'
import { matchesQuery } from '@/helpers/search-text'

/** One senator's line in the nominal list. */
export type SenateNominalLine = {
  ballot: SenateBallot
  /** What the senator declared afterwards, if they did. */
  correction: BallotPosition | null
  /** Their group on the day of the vote. */
  groupId: SenateGroupId
  /** `null` for an id the senators dataset does not know. */
  senator: Senator | null
}

export const senateNominalNameOf = (line: SenateNominalLine): string =>
  line.senator === null
    ? line.ballot.senatorId
    : senatorFullNameOf(line.senator)

const sortableName = (line: SenateNominalLine): string =>
  line.senator === null
    ? line.ballot.senatorId
    : `${line.senator.lastName} ${line.senator.firstName}`

/** Everyone with a recorded ballot, by last name. */
export const senateNominalLinesOf = ({
  scrutin,
  senatorsById
}: {
  scrutin: SenateScrutinDetail
  senatorsById: ReadonlyMap<SenatorId, Senator>
}): SenateNominalLine[] => {
  const correctionBySenator = new Map(
    scrutin.corrections.map((correction) => [
      correction.senatorId,
      correction.intended
    ])
  )

  return scrutin.groups
    .flatMap((groupVote) =>
      groupVote.ballots.map((ballot) => ({
        ballot,
        correction: correctionBySenator.get(ballot.senatorId) ?? null,
        groupId: groupVote.groupId,
        senator: senatorsById.get(ballot.senatorId) ?? null
      }))
    )
    .toSorted((first, second) =>
      compareFrench(sortableName(first), sortableName(second))
    )
}

export const filterSenateNominalLines = ({
  lines,
  position,
  query
}: {
  lines: readonly SenateNominalLine[]
  position: NominalPositionFilter
  query: string
}): SenateNominalLine[] =>
  lines.filter(
    (line) =>
      (position === 'all' || line.ballot.position === position) &&
      matchesQuery({ query, text: senateNominalNameOf(line) })
  )
