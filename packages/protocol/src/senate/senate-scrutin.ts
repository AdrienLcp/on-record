import { z } from 'zod'

import { ballotPositionSchema } from '../votes/ballot-position'
import { scrutinKindSchema } from '../votes/scrutin-kind'
import { scrutinOutcomeSchema } from '../votes/scrutin-outcome'
import { voteTotalsSchema } from '../votes/vote-totals'
import {
  senateGroupIdSchema,
  senateScrutinIdSchema,
  senatorIdSchema
} from './senate-ids'

/** The bill a scrutin belongs to, as the Senate names its legislative file. */
export const senateLegislativeFileSchema = z.object({
  /** Path of the file on senat.fr, below `/dossier-legislatif/`. */
  id: z.string().min(1),
  /** Short name, e.g. « Budget 2025 ». */
  title: z.string().min(1)
})

export const senateScrutinSummarySchema = z.object({
  date: z.iso.date(),
  id: senateScrutinIdSchema,
  /** `solemn` when ballots were cast by delegation; the Senate has no censure. */
  kind: scrutinKindSchema,
  legislativeFile: senateLegislativeFileSchema.nullable(),
  number: z.number().int().positive(),
  outcome: scrutinOutcomeSchema,
  /** The year the session opened: `2025` for 2025-2026. */
  session: z.number().int().positive(),
  /** Official title, as the Senate words it. */
  title: z.string().min(1),
  /** The official totals, which a recount of the ballots may miss by one or two. */
  totals: voteTotalsSchema
})

/**
 * Why a senator took no part, when the Senate records a reason: presiding the
 * sitting, member of the government, or a declared conflict of interest.
 */
export const senateNonVotingCauseSchema = z.enum([
  'presiding',
  'government',
  'recusal'
])

export const senateBallotSchema = z.object({
  /** Cast by a colleague holding this senator's delegation. */
  byDelegation: z.boolean(),
  cause: senateNonVotingCauseSchema.nullable(),
  position: ballotPositionSchema,
  senatorId: senatorIdSchema
})

export const senateGroupVoteSchema = z.object({
  ballots: z.array(senateBallotSchema),
  groupId: senateGroupIdSchema,
  /**
   * The most frequent of for, against and abstention among the group's
   * members who voted, computed from their ballots. `null` on a tie or when
   * no member voted.
   */
  majorityPosition: ballotPositionSchema.nullable(),
  memberCount: z.number().int().nonnegative(),
  totals: voteTotalsSchema
})

/** A "mise au point": the vote a senator declared afterwards as the one meant. */
export const senateCorrectionSchema = z.object({
  intended: ballotPositionSchema,
  senatorId: senatorIdSchema
})

export const senateScrutinDetailSchema = senateScrutinSummarySchema.extend({
  corrections: z.array(senateCorrectionSchema),
  groups: z.array(senateGroupVoteSchema)
})

/** A scrutin the Senate numbered but left out of its open data. */
export const missingSenateScrutinSchema = z.object({
  id: senateScrutinIdSchema,
  number: z.number().int().positive(),
  session: z.number().int().positive()
})

export const senateScrutinIndexSchema = z.object({
  missing: z.array(missingSenateScrutinSchema),
  /** Newest first. */
  scrutins: z.array(senateScrutinSummarySchema)
})

export const senateScrutinBlockSchema = z.array(senateScrutinDetailSchema)

export type MissingSenateScrutin = z.infer<typeof missingSenateScrutinSchema>
export type SenateBallot = z.infer<typeof senateBallotSchema>
export type SenateCorrection = z.infer<typeof senateCorrectionSchema>
export type SenateGroupVote = z.infer<typeof senateGroupVoteSchema>
export type SenateLegislativeFile = z.infer<typeof senateLegislativeFileSchema>
export type SenateNonVotingCause = z.infer<typeof senateNonVotingCauseSchema>
export type SenateScrutinDetail = z.infer<typeof senateScrutinDetailSchema>
export type SenateScrutinIndex = z.infer<typeof senateScrutinIndexSchema>
export type SenateScrutinSummary = z.infer<typeof senateScrutinSummarySchema>
