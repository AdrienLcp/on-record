import { Result } from '@adrienlcp/result'

import type {
  SenateGroupId,
  SenatorId
} from '@on-record/protocol/senate/senate-ids.ts'
import type {
  SenateBallot,
  SenateCorrection,
  SenateLegislativeFile,
  SenateNonVotingCause,
  SenateScrutinDetail
} from '@on-record/protocol/senate/senate-scrutin.ts'
import { senateScrutinIdFor } from '@on-record/protocol/senate/senate-scrutin-number.ts'
import type { SenateGroupMembership } from '@on-record/protocol/senate/senator.ts'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position.ts'
import type { VoteTotals } from '@on-record/protocol/votes/vote-totals.ts'

import { groupAtDate } from '@/domain/assembly-votes/group-at-date.ts'
import { majorityPositionOf } from '@/domain/assembly-votes/scrutin-detail.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type {
  RawScrutinRow,
  RawSenatorBallotRow
} from '@/domain/senate-votes/raw-senate-rows.ts'

const positionByCode = {
  '1': 'for',
  '2': 'against',
  '3': 'abstention',
  '4': 'nonVoting'
} as const satisfies Record<RawSenatorBallotRow['posvotcod'], BallotPosition>

const causeByCode = {
  '0': null,
  '8': 'presiding',
  '9': 'government',
  '12': 'recusal'
} as const satisfies Record<
  RawSenatorBallotRow['stavotidt'],
  SenateNonVotingCause | null
>

const MISE_AU_POINT_FLAG = '*'

export const isFlaggedForCorrection = (row: RawSenatorBallotRow): boolean =>
  row.votsenmar === MISE_AU_POINT_FLAG

/** The dump has no outcome: a tie rejects, as in the chamber. */
export const isAdopted = (row: RawScrutinRow): boolean =>
  row.scrpou > row.scrcon

/**
 * The official totals. Abstentions are the votes cast minus those that count
 * towards the majority; senators who took no part are counted from the
 * ballots, the only place they appear.
 */
export const senateTotalsOf = (
  row: RawScrutinRow,
  ballots: readonly RawSenatorBallotRow[]
): VoteTotals => ({
  abstention: row.scrvot - row.scrsuf,
  against: row.scrcon,
  for: row.scrpou,
  nonVoting: ballots.filter((ballot) => ballot.posvotcod === '4').length
})

const countPositions = (ballots: readonly SenateBallot[]): VoteTotals => ({
  abstention: ballots.filter((ballot) => ballot.position === 'abstention')
    .length,
  against: ballots.filter((ballot) => ballot.position === 'against').length,
  for: ballots.filter((ballot) => ballot.position === 'for').length,
  nonVoting: ballots.filter((ballot) => ballot.position === 'nonVoting').length
})

/**
 * One scrutin with every senator's ballot under the group they sat in that
 * day. A vote cast by delegation marks a solemn vote: the Senate opens
 * delegations only for scheduled votes on whole texts.
 */
export const toSenateScrutin = ({
  ballots,
  corrections,
  legislativeFile,
  membershipsOf,
  row
}: {
  ballots: readonly RawSenatorBallotRow[]
  corrections: SenateCorrection[]
  legislativeFile: SenateLegislativeFile | null
  membershipsOf: (senatorId: SenatorId) => readonly SenateGroupMembership[]
  row: RawScrutinRow
}): Result<SenateScrutinDetail, IngestError> => {
  const id = senateScrutinIdFor({ number: row.scrnum, session: row.sesann })
  const ballotsByGroup = new Map<SenateGroupId, SenateBallot[]>()
  for (const ballot of ballots) {
    const groupId = groupAtDate(membershipsOf(ballot.senmat), row.scrdat)
    if (groupId === null) {
      return Result.failure({ code: 'unresolved_group', scrutin: id })
    }
    ballotsByGroup.set(groupId, [
      ...(ballotsByGroup.get(groupId) ?? []),
      {
        byDelegation: ballot.senmatdel !== null,
        cause: causeByCode[ballot.stavotidt],
        position: positionByCode[ballot.posvotcod],
        senatorId: ballot.senmat
      }
    ])
  }

  const recordedPositionOf = new Map(
    ballots.map((ballot) => [ballot.senmat, positionByCode[ballot.posvotcod]])
  )

  return Result.success({
    // The Senate repeats a sentence on the next scrutin of the sitting, where
    // it sometimes names a ballot already cast that way: no change to show.
    corrections: corrections.filter(
      (correction) =>
        recordedPositionOf.get(correction.senatorId) !== correction.intended
    ),
    date: row.scrdat,
    groups: [...ballotsByGroup].map(([groupId, groupBallots]) => {
      const totals = countPositions(groupBallots)
      return {
        ballots: groupBallots,
        groupId,
        majorityPosition: majorityPositionOf(totals),
        memberCount: groupBallots.length,
        totals
      }
    }),
    id,
    kind: ballots.some((ballot) => ballot.senmatdel !== null)
      ? 'solemn'
      : 'ordinary',
    legislativeFile,
    number: row.scrnum,
    outcome: isAdopted(row) ? 'adopted' : 'rejected',
    session: row.sesann,
    title: row.scrint,
    totals: senateTotalsOf(row, ballots)
  })
}
