import { z } from 'zod'

export const voteTotalsSchema = z.object({
  abstention: z.number().int().nonnegative(),
  against: z.number().int().nonnegative(),
  for: z.number().int().nonnegative(),
  nonVoting: z.number().int().nonnegative()
})

export type VoteTotals = z.infer<typeof voteTotalsSchema>
