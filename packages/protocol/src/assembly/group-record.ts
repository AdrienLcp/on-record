import { z } from 'zod'

import { ballotPositionSchema } from '../votes/ballot-position'
import { voteTotalsSchema } from '../votes/vote-totals'
import { organIdSchema } from './official-ids'

/** How one group voted on one scrutin. Scrutins held while the group did not exist have no entry. */
export const groupScrutinVoteSchema = z.object({
  /** The members the group counted that day. */
  memberCount: z.number().int().nonnegative(),
  /**
   * The most frequent of for, against and abstention among the group's
   * members who voted, computed from their ballots. `null` on a tie or when
   * no member voted.
   */
  position: ballotPositionSchema.nullable(),
  scrutin: z.number().int().positive(),
  totals: voteTotalsSchema
})

/**
 * Every scrutin one group took part in, newest first: a group page reads a
 * few hundred kilobytes instead of every scrutin block.
 */
export const groupRecordSchema = z.object({
  groupId: organIdSchema,
  votes: z.array(groupScrutinVoteSchema)
})

export type GroupRecord = z.infer<typeof groupRecordSchema>
export type GroupScrutinVote = z.infer<typeof groupScrutinVoteSchema>
