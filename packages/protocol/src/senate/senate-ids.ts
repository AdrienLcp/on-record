import { z } from 'zod'

/** A senator's matricule in the Senate open data: five digits and a letter. */
export const senatorIdSchema = z.string().regex(/^\d{5}[A-Z]$/)

/** A political group code of the Senate open data (`grppolcod`): `SOC`, `UC`… */
export const senateGroupIdSchema = z.string().regex(/^[A-Z0-9-]+$/)

/**
 * A Senate scrutin: the year its session opened and its number in that
 * session, `2025-340`. Numbers restart with each session.
 */
export const senateScrutinIdSchema = z.string().regex(/^\d{4}-[1-9]\d*$/)

export type SenateGroupId = z.infer<typeof senateGroupIdSchema>
export type SenateScrutinId = z.infer<typeof senateScrutinIdSchema>
export type SenatorId = z.infer<typeof senatorIdSchema>
