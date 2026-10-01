import { Result } from '@adrienlcp/result'

import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position.ts'
import type {
  DeputyRecord,
  RecordedBallot
} from '@on-record/protocol/assembly/deputy-record.ts'
import type { DeputyId } from '@on-record/protocol/assembly/official-ids.ts'
import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import type { IngestError } from '@/domain/ingest-errors.ts'

const intendedByDeputy = (
  scrutin: ScrutinDetail
): ReadonlyMap<DeputyId, BallotPosition> =>
  new Map(
    scrutin.corrections
      .toReversed()
      .map((correction) => [correction.deputyId, correction.intended])
  )

/**
 * Every deputy's own record, newest scrutin first. A ballot carries the
 * majority position of the group it was listed under in that scrutin, and the
 * deputy's "mise au point" beside it. A deputy with no ballot gets an empty
 * record, so every deputy page has its file.
 */
export const toDeputyRecords = ({
  deputyIds,
  scrutins
}: {
  deputyIds: readonly DeputyId[]
  scrutins: readonly ScrutinDetail[]
}): Result<DeputyRecord[], IngestError> => {
  const ballotsByDeputy = new Map<DeputyId, RecordedBallot[]>(
    deputyIds.map((deputyId) => [deputyId, []])
  )
  const newestFirst = scrutins.toSorted(
    (left, right) => right.number - left.number
  )

  for (const scrutin of newestFirst) {
    const corrections = intendedByDeputy(scrutin)
    for (const group of scrutin.groups) {
      for (const ballot of group.ballots) {
        const deputyBallots = ballotsByDeputy.get(ballot.deputyId)
        if (deputyBallots === undefined) {
          return Result.failure({
            code: 'unknown_deputy',
            deputyId: ballot.deputyId,
            scrutin: scrutin.number
          })
        }
        deputyBallots.push({
          byDelegation: ballot.byDelegation,
          correction: corrections.get(ballot.deputyId) ?? null,
          groupPosition: group.majorityPosition,
          position: ballot.position,
          scrutin: scrutin.number
        })
      }
    }
  }

  return Result.success(
    [...ballotsByDeputy].map(([deputyId, ballots]) => ({ ballots, deputyId }))
  )
}
