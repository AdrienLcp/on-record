import { z } from 'zod'

/** An actor id of the Assemblée open data (`PA` + digits). */
export const deputyIdSchema = z.string().regex(/^PA\d+$/)

/** An organ id of the Assemblée open data (`PO` + digits): groups, committees… */
export const organIdSchema = z.string().regex(/^PO\d+$/)

export type DeputyId = z.infer<typeof deputyIdSchema>
export type OrganId = z.infer<typeof organIdSchema>

/**
 * A department as the Assemblée codes it: `01`…`95`, `2A`, `2B`, `971`…`988`
 * for overseas, `099` for French people abroad.
 */
export const departmentCodeSchema = z.string().regex(/^(\d{2,3}|2[AB])$/)

export type DepartmentCode = z.infer<typeof departmentCodeSchema>
