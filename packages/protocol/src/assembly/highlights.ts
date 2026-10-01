import { z } from 'zod'

import { scrutinSummarySchema } from './scrutin'

export const HIGHLIGHTED_SOLEMN_VOTES = 10

export const HIGHLIGHTED_CENSURE_MOTIONS = 5

/**
 * The latest votes people recognise, newest first, so the home page reads a
 * few kilobytes instead of the whole scrutin index. Picked by kind and date
 * alone: no editorial selection.
 */
export const highlightsSchema = z.object({
  censureMotions: z
    .array(scrutinSummarySchema)
    .max(HIGHLIGHTED_CENSURE_MOTIONS),
  solemnVotes: z.array(scrutinSummarySchema).max(HIGHLIGHTED_SOLEMN_VOTES)
})

export type Highlights = z.infer<typeof highlightsSchema>
