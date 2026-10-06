import { z } from 'zod'

import { periodSchema } from '../period'
import { senateGroupIdSchema, senatorIdSchema } from './senate-ids'

export const senateGroupMembershipSchema = periodSchema.extend({
  groupId: senateGroupIdSchema
})

/** Everyone who held a seat since the covered scrutins began. */
export const senatorSchema = z.object({
  birthDate: z.iso.date().nullable(),
  /**
   * Where the senator was elected: a department, an overseas community, or
   * French people abroad.
   */
  constituency: z.object({
    code: z.string().min(1),
    name: z.string().min(1)
  }),
  firstName: z.string().min(1),
  gender: z.enum(['female', 'male']),
  /** Ordered oldest first. */
  groups: z.array(senateGroupMembershipSchema),
  /** The senator's page on hatvp.fr, where declarations of interests live. */
  hatvpUrl: z.url().nullable(),
  id: senatorIdSchema,
  lastName: z.string().min(1),
  /** Seat periods overlapping the covered scrutins, oldest first. */
  mandates: z.array(periodSchema).min(1),
  profession: z.string().nullable()
})

export const senatorsSchema = z.array(senatorSchema)

export type SenateGroupMembership = z.infer<typeof senateGroupMembershipSchema>
export type Senator = z.infer<typeof senatorSchema>
