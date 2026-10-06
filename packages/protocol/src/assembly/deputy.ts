import { z } from 'zod'

import { periodSchema } from '../period'
import {
  departmentCodeSchema,
  deputyIdSchema,
  organIdSchema
} from './official-ids'

/** A spell in one political group; several when the deputy changed group. */
export const groupMembershipSchema = periodSchema.extend({
  groupId: organIdSchema
})

/** Everyone who held a seat during the legislature, those who left included. */
export const deputySchema = z.object({
  birthDate: z.iso.date().nullable(),
  /** Constituency number within the department. */
  constituency: z.number().int().positive(),
  department: z.object({
    /** Official department code: `75`, `2A`, `971`, `099` for French people abroad. */
    code: departmentCodeSchema,
    name: z.string().min(1)
  }),
  firstName: z.string().min(1),
  gender: z.enum(['female', 'male']),
  /** Ordered oldest first. */
  groups: z.array(groupMembershipSchema),
  /** The deputy's page on hatvp.fr, where declarations of interests live. */
  hatvpUrl: z.url().nullable(),
  id: deputyIdSchema,
  lastName: z.string().min(1),
  /** Seat periods in this legislature, oldest first. */
  mandates: z.array(periodSchema).min(1),
  profession: z.string().nullable()
})

export const deputiesSchema = z.array(deputySchema)

export type Deputy = z.infer<typeof deputySchema>
export type GroupMembership = z.infer<typeof groupMembershipSchema>
