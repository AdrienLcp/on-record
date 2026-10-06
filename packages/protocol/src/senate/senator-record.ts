import { z } from 'zod'

import { ballotPositionSchema } from '../votes/ballot-position'
import { senateScrutinIdSchema, senatorIdSchema } from './senate-ids'

/** One senator's line on one Senate scrutin. */
export const senatorBallotSchema = z.object({
  byDelegation: z.boolean(),
  /** The "mise au point" this senator declared, if any. */
  correction: ballotPositionSchema.nullable(),
  /**
   * The most frequent of for, against and abstention among the group's
   * members who voted, computed from their ballots. `null` on a tie, when no
   * member voted, or when the senator sat in no group.
   */
  groupPosition: ballotPositionSchema.nullable(),
  position: ballotPositionSchema,
  scrutin: senateScrutinIdSchema
})

/** Every recorded ballot of one senator, newest scrutin first. */
export const senatorRecordSchema = z.object({
  ballots: z.array(senatorBallotSchema),
  senatorId: senatorIdSchema
})

export type SenatorBallot = z.infer<typeof senatorBallotSchema>
export type SenatorRecord = z.infer<typeof senatorRecordSchema>
