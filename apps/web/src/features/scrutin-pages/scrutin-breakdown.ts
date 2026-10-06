import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids'
import type {
  Ballot,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'
import { compareFrench } from '@on-record/protocol/french-order'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import type { NominalPositionFilter } from '@/features/scrutins/nominal-position-filter'
import { matchesQuery } from '@/helpers/search-text'

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
      compareFrench(sortableName(first), sortableName(second))
    )
}

const sortableName = (line: NominalLine): string =>
  line.deputy === null
    ? line.ballot.deputyId
    : `${line.deputy.lastName} ${line.deputy.firstName}`

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
