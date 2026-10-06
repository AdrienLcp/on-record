import { z } from 'zod'

import { booleanString } from '@/domain/raw-values.ts'

/**
 * The fields read from a line of any section. Each section fills its own
 * subset; amounts, comments and the declarant's personal details are never read.
 */
const rawDeclaredItemSchema = z.object({
  activite: z.string().optional(),
  conservee: z.string().optional(),
  contenu: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  description: z.string().optional(),
  descriptionActivite: z.string().optional(),
  descriptionMandat: z.string().optional(),
  employeur: z.string().optional(),
  nomEmployeur: z.string().optional(),
  nomSociete: z.string().optional(),
  nomStructure: z.string().optional()
})

/**
 * `<xDto><items><items>…</items></items><neant>…</neant></xDto>`. An empty
 * `<items/>` reads as `''`, and a section declared « néant » may have no
 * `<items>` at all.
 */
const rawSectionSchema = z.object({
  items: z
    .union([
      z.literal('').transform(() => []),
      z
        .object({ items: z.array(rawDeclaredItemSchema) })
        .transform((list) => list.items)
    ])
    .optional()
    .transform((items) => items ?? []),
  neant: booleanString
})

/** The sections of a unit declaration of interests XML (`<declaration>`). */
export const rawInterestsDeclarationSchema = z.object({
  declaration: z.object({
    activCollaborateursDto: rawSectionSchema,
    activConsultantDto: rawSectionSchema,
    activProfCinqDerniereDto: rawSectionSchema,
    activProfConjointDto: rawSectionSchema,
    fonctionBenevoleDto: rawSectionSchema,
    mandatElectifDto: rawSectionSchema,
    observationInteretDto: rawSectionSchema,
    participationDirigeantDto: rawSectionSchema,
    participationFinanciereDto: rawSectionSchema
  })
})

/** The element path of a section's lines, which must always read as a list. */
export const isDeclaredItemList = (elementPath: string): boolean =>
  /^declaration\.\w+Dto\.items\.items$/.test(elementPath)

export type RawDeclaredItem = z.infer<typeof rawDeclaredItemSchema>
export type RawInterestsDeclaration = z.infer<
  typeof rawInterestsDeclarationSchema
>
export type RawSection = z.infer<typeof rawSectionSchema>
