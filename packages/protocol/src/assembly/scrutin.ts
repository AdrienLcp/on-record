import { z } from 'zod'

import { ballotPositionSchema } from './ballot-position'
import { deputyIdSchema, organIdSchema } from './official-ids'

/**
 * - `ordinary` — a public vote requested during the sitting
 * - `solemn` — a scheduled vote, usually on a whole bill
 * - `censure` — a motion of censure against the government
 */
export const scrutinKindSchema = z.enum(['ordinary', 'solemn', 'censure'])

export const scrutinOutcomeSchema = z.enum(['adopted', 'rejected'])

export const voteTotalsSchema = z.object({
  abstention: z.number().int().nonnegative(),
  against: z.number().int().nonnegative(),
  for: z.number().int().nonnegative(),
  nonVoting: z.number().int().nonnegative()
})

/** What a list of scrutins needs: no nominal votes. */
export const scrutinSummarySchema = z.object({
  date: z.iso.date(),
  kind: scrutinKindSchema,
  /** Id of the legislative file (`DLR…`) the vote belongs to, when known. */
  legislativeFileId: z.string().nullable(),
  number: z.number().int().positive(),
  outcome: scrutinOutcomeSchema,
  /** Official title, as the Assemblée words it. */
  title: z.string().min(1),
  totals: voteTotalsSchema
})

export const ballotSchema = z.object({
  /** Cast by a colleague holding this deputy's delegation. */
  byDelegation: z.boolean(),
  /** Official reason for a non-vote (e.g. `PAN`, presiding the sitting), if any. */
  cause: z.string().nullable(),
  deputyId: deputyIdSchema,
  position: ballotPositionSchema
})

export const groupVoteSchema = z.object({
  ballots: z.array(ballotSchema),
  groupId: organIdSchema,
  /**
   * The position the Assemblée publishes for the group
   * (`positionMajoritaire`), which can differ from the most frequent vote
   * among its members. `null` when no member voted.
   */
  majorityPosition: ballotPositionSchema.nullable(),
  memberCount: z.number().int().nonnegative(),
  totals: voteTotalsSchema
})

/**
 * A "mise au point": the vote a deputy declared afterwards as the one they
 * meant. The recorded ballot is not changed by it.
 */
export const correctionSchema = z.object({
  deputyId: deputyIdSchema,
  intended: ballotPositionSchema
})

export const scrutinDetailSchema = scrutinSummarySchema.extend({
  corrections: z.array(correctionSchema),
  groups: z.array(groupVoteSchema),
  /** Who asked for the public vote, as worded officially. */
  requester: z.string().nullable()
})

export const scrutinIndexSchema = z.array(scrutinSummarySchema)

/** Scrutins are published in blocks, to stay far under the host's file count. */
export const scrutinBlockSchema = z.array(scrutinDetailSchema)

export const SCRUTINS_PER_BLOCK = 100

export const scrutinBlockOf = (scrutinNumber: number): number =>
  Math.floor(scrutinNumber / SCRUTINS_PER_BLOCK)

export type Ballot = z.infer<typeof ballotSchema>
export type Correction = z.infer<typeof correctionSchema>
export type GroupVote = z.infer<typeof groupVoteSchema>
export type ScrutinDetail = z.infer<typeof scrutinDetailSchema>
export type ScrutinKind = z.infer<typeof scrutinKindSchema>
export type ScrutinOutcome = z.infer<typeof scrutinOutcomeSchema>
export type ScrutinSummary = z.infer<typeof scrutinSummarySchema>
export type VoteTotals = z.infer<typeof voteTotalsSchema>
