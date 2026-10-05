import { z } from 'zod'

import { deputyIdSchema } from './official-ids'

/**
 * - `adopted`, `rejected` — decided by a vote
 * - `fell` — made moot before its turn, usually by another amendment adopted first
 * - `notMoved` — nobody defended it when its turn came in the sitting
 * - `withdrawn` — its author took it back
 * - `inadmissible` — set aside before any debate by a procedure filter
 *   (cost to public finances, no link with the text…)
 * - `pending` — not examined yet
 */
export const amendmentOutcomeSchema = z.enum([
  'adopted',
  'rejected',
  'fell',
  'notMoved',
  'withdrawn',
  'inadmissible',
  'pending'
])

/** Where in the text an amendment applies, as the Assemblée shortens it: `ART. 2`, `APRÈS ART. 3`. */
const articleDesignationSchema = z.string().min(1)

/** One amendment a deputy tabled as its first signatory. */
export const tabledAmendmentSchema = z.object({
  /** `null` when the amendment targets no article: a title, an annex… */
  article: articleDesignationSchema.nullable(),
  /** Tabled as rapporteur, on behalf of a committee rather than in their own name. */
  asRapporteur: z.boolean(),
  /** `null` for the few the open data leaves undated. */
  date: z.iso.date().nullable(),
  /** `null` when the open data files it under no legislative file. */
  legislativeFileId: z.string().nullable(),
  /** Official number, as printed: `2194`, `I-2194`, `AS2`, `89 (Rect)`. */
  number: z.string().min(1),
  /**
   * Path of the official page below `/dyn/<legislature>/amendements/`, e.g.
   * `1906A/AN/2194`. `null` when the open data does not let one be built.
   */
  officialPath: z.string().min(1).nullable(),
  /** `AN` for the sitting; a committee code (`CION_FIN`, `CION-SOC`…) otherwise. */
  organ: z.string().min(1),
  outcome: amendmentOutcomeSchema,
  /** The scrutin that decided it, when one did and could be matched. */
  scrutin: z.number().int().positive().nullable(),
  /** The start of the author's own summary, in plain text. */
  summary: z.string().nullable()
})

/** Every amendment a deputy tabled, newest first, and how many others they co-signed. */
export const deputyAmendmentsSchema = z.object({
  amendments: z.array(tabledAmendmentSchema),
  /** Co-signatures only, never listed: groups co-sign by the hundred. */
  cosignedCount: z.number().int().nonnegative(),
  deputyId: deputyIdSchema
})

/** The titles of the legislative files the amendments cite. */
export const legislativeFileTitlesSchema = z.array(
  z.object({ id: z.string().min(1), title: z.string().min(1) })
)

export type AmendmentOutcome = z.infer<typeof amendmentOutcomeSchema>
export type DeputyAmendments = z.infer<typeof deputyAmendmentsSchema>
export type LegislativeFileTitles = z.infer<typeof legislativeFileTitlesSchema>
export type TabledAmendment = z.infer<typeof tabledAmendmentSchema>
