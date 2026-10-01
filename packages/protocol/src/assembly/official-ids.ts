import { z } from 'zod'

/** An actor id of the Assemblée open data (`PA` + digits). */
export const deputyIdSchema = z.string().regex(/^PA\d+$/)

/** An organ id of the Assemblée open data (`PO` + digits): groups, committees… */
export const organIdSchema = z.string().regex(/^PO\d+$/)

export type DeputyId = z.infer<typeof deputyIdSchema>
export type OrganId = z.infer<typeof organIdSchema>
