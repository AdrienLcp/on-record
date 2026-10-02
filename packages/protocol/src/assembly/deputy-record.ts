import { z } from 'zod'

import { ballotPositionSchema } from './ballot-position'
import { deputyIdSchema } from './official-ids'

/** One deputy's line on one scrutin. Scrutins the deputy missed have no entry. */
export const recordedBallotSchema = z.object({
  byDelegation: z.boolean(),
  /** The "mise au point" this deputy declared, if any. */
  correction: ballotPositionSchema.nullable(),
  /**
   * The most frequent of for, against and abstention among the group's
   * members who voted, computed from their ballots. `null` on a tie or when
   * no member voted.
   */
  groupPosition: ballotPositionSchema.nullable(),
  position: ballotPositionSchema,
  scrutin: z.number().int().positive()
})

/** Every recorded ballot of one deputy, newest scrutin first. */
export const deputyRecordSchema = z.object({
  ballots: z.array(recordedBallotSchema),
  deputyId: deputyIdSchema
})

export type DeputyRecord = z.infer<typeof deputyRecordSchema>
export type RecordedBallot = z.infer<typeof recordedBallotSchema>
