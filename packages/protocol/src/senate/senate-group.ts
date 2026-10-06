import { z } from 'zod'

import { senateGroupIdSchema } from './senate-ids'

/**
 * A political group of the Senate. Codes outlive renames (`UMP` is today's
 * Les Républicains), so names are the latest ones.
 */
export const senateGroupSchema = z.object({
  /** The Senate publishes no colour: always `null`, like a colourless Assemblée group. */
  color: z.null(),
  id: senateGroupIdSchema,
  name: z.string().min(1),
  shortName: z.string().min(1)
})

export const senateGroupsSchema = z.array(senateGroupSchema)

export type SenateGroup = z.infer<typeof senateGroupSchema>
