import { z } from 'zod'

import { ballotPositionSchema } from './ballot-position'
import { deputyIdSchema } from './official-ids'

/** One deputy's line on one scrutin. Scrutins the deputy missed have no entry. */
export const recordedBallotSchema = z.object({
  byDelegation: z.boolean(),
  /** The "mise au point" this deputy declared, if any. */
  correction: ballotPositionSchema.nullable(),
  /** How the deputy's group mostly voted; `null` when it had no majority. */
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
