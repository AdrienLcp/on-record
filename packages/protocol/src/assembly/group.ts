import { z } from 'zod'

import { organIdSchema } from './official-ids'

/** A political group of the chamber, as it existed between `from` and `to`. */
export const groupSchema = z.object({
  /** Official colour, `#rrggbb`, or `null` when the Assemblée gives none. */
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .nullable(),
  from: z.iso.date(),
  id: organIdSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  /** `null` while the group exists. */
  to: z.iso.date().nullable()
})

export const groupsSchema = z.array(groupSchema)

export type Group = z.infer<typeof groupSchema>
