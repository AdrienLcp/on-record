import { z } from 'zod'

import { departmentCodeSchema } from './official-ids'

/** A commune's INSEE code: five characters, `2A…` / `2B…` in Corsica. */
export const communeCodeSchema = z.string().regex(/^(\d{5}|2[AB]\d{3})$/)

export const postcodeSchema = z.string().regex(/^\d{5}$/)

/**
 * One commune of today's map, packed as a tuple because the index lists
 * about 35,000 of them: `[code, name, postcodes, department, constituencies]`.
 * `constituencies` are numbers within `department`, several when the commune
 * is split between constituencies.
 */
export const communeEntrySchema = z.tuple([
  communeCodeSchema,
  z.string().min(1),
  z.array(postcodeSchema),
  departmentCodeSchema,
  z.array(z.number().int().positive()).min(1)
])

/** Every current commune, for the "find my deputy" search. */
export const communeIndexSchema = z.array(communeEntrySchema)

export type CommuneCode = z.infer<typeof communeCodeSchema>
export type CommuneEntry = z.infer<typeof communeEntrySchema>
