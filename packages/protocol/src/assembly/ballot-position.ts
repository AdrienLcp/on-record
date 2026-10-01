import { z } from 'zod'

/** How a deputy is recorded on one scrutin, or how a group mostly voted. */
export const ballotPositionSchema = z.enum([
  'for',
  'against',
  'abstention',
  'nonVoting'
])

export type BallotPosition = z.infer<typeof ballotPositionSchema>
