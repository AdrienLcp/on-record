import { Result } from '@adrienlcp/result'

import type { SenatorId } from '@on-record/protocol/senate/senate-ids.ts'
import type { SenateScrutinDetail } from '@on-record/protocol/senate/senate-scrutin.ts'
import type {
  SenatorBallot,
  SenatorRecord
} from '@on-record/protocol/senate/senator-record.ts'

import type { IngestError } from '@/domain/ingest-errors.ts'

/** Newest session first, then newest number within it. */
export const newestSenateScrutinFirst = (
  left: { number: number; session: number },
  right: { number: number; session: number }
): number => right.session - left.session || right.number - left.number

/**
 * Every senator's own record, newest scrutin first: each ballot with the
 * majority position of the group the senator sat in, and the "mise au point"
 * beside it. A senator with no ballot gets an empty record, so every senator
 * page has its file.
 */
export const toSenatorRecords = ({
  scrutins,
  senatorIds
}: {
  scrutins: readonly SenateScrutinDetail[]
  senatorIds: readonly SenatorId[]
}): Result<SenatorRecord[], IngestError> => {
  const ballotsBySenator = new Map<SenatorId, SenatorBallot[]>(
    senatorIds.map((senatorId) => [senatorId, []])
  )
  for (const scrutin of scrutins.toSorted(newestSenateScrutinFirst)) {
    const corrections = new Map(
      scrutin.corrections.map((correction) => [
        correction.senatorId,
        correction.intended
      ])
    )
    for (const group of scrutin.groups) {
      for (const ballot of group.ballots) {
        const senatorBallots = ballotsBySenator.get(ballot.senatorId)
        if (senatorBallots === undefined) {
          return Result.failure({
            code: 'unknown_senator',
            scrutin: scrutin.id,
            senatorId: ballot.senatorId
          })
        }
        senatorBallots.push({
          byDelegation: ballot.byDelegation,
          correction: corrections.get(ballot.senatorId) ?? null,
          groupPosition: group.majorityPosition,
          position: ballot.position,
          scrutin: scrutin.id
        })
      }
    }
  }
  return Result.success(
    [...ballotsBySenator].map(([senatorId, ballots]) => ({
      ballots,
      senatorId
    }))
  )
}
