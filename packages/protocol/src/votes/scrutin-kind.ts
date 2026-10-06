import { z } from 'zod'

/**
 * - `ordinary` — a public vote requested during the sitting
 * - `solemn` — a scheduled vote, usually on a whole bill
 * - `censure` — a motion of censure against the government (Assemblée only)
 */
export const scrutinKindSchema = z.enum(['ordinary', 'solemn', 'censure'])

export type ScrutinKind = z.infer<typeof scrutinKindSchema>
