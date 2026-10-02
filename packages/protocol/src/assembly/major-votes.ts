import { z } from 'zod'

import { ballotPositionSchema } from './ballot-position'
import { organIdSchema } from './official-ids'
import { scrutinSummarySchema, voteTotalsSchema } from './scrutin'

/** How one group voted on one scrutin, without its members' ballots. */
export const groupStanceSchema = z.object({
  groupId: organIdSchema,
  /** The members the group counted that day. */
  memberCount: z.number().int().nonnegative(),
  /**
   * The most frequent of for, against and abstention among the group's
   * members who voted, computed from their ballots. `null` on a tie or when
   * no member voted.
   */
  position: ballotPositionSchema.nullable(),
  totals: voteTotalsSchema
})

/** A solemn vote or a motion of censure, with every group listed that day. */
export const majorVoteSchema = scrutinSummarySchema.extend({
  groups: z.array(groupStanceSchema)
})

/**
 * Every solemn vote and motion of censure of the legislature, newest first:
 * a page that compares groups vote by vote reads a hundred votes instead of
 * the whole scrutin index and one record per group. Picked by kind alone.
 */
export const majorVotesSchema = z.array(majorVoteSchema)

export type GroupStance = z.infer<typeof groupStanceSchema>
export type MajorVote = z.infer<typeof majorVoteSchema>
