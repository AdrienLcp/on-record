import { z } from 'zod'

export const scrutinOutcomeSchema = z.enum(['adopted', 'rejected'])

export type ScrutinOutcome = z.infer<typeof scrutinOutcomeSchema>
