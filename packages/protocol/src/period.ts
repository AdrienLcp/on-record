import { z } from 'zod'

/** A dated spell: a seat, a group membership. */
export const periodSchema = z.object({
  from: z.iso.date(),
  /** `null` while it lasts. */
  to: z.iso.date().nullable()
})

export type Period = z.infer<typeof periodSchema>
