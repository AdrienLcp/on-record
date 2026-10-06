import { z } from 'zod'

/**
 * What a declaration to the HATVP declares:
 * - `interests` — interests and activities, filed at the start of a mandate
 * - `interestsUpdate` — a later version of it, restating the whole declaration
 * - `assets` — assets at the start of a mandate
 * - `assetsUpdate` — a substantial change in assets during the mandate
 * - `assetsEndOfMandate` — assets at the end of a mandate
 */
export const declarationKindSchema = z.enum([
  'interests',
  'interestsUpdate',
  'assets',
  'assetsUpdate',
  'assetsEndOfMandate'
])

/**
 * Where a declaration stands at the HATVP:
 * - `published` — online for interests, consultable in the prefecture for assets
 * - `awaitingPublication` — filed, not published yet
 * - `inProgress` — the HATVP is handling it; nothing is dated yet
 * - `notFiled` — the HATVP reports it was not filed
 * - `exempt` — the official did not have to file it
 */
export const declarationStatusSchema = z.enum([
  'published',
  'awaitingPublication',
  'inProgress',
  'notFiled',
  'exempt'
])

/**
 * Asset declarations of parliamentarians can only be consulted in the
 * prefecture, and publishing their content is an offence (electoral code,
 * LO 135-2): they are listed, never linked.
 */
export const isAssetDeclaration = (kind: DeclarationKind): boolean =>
  kind === 'assets' || kind === 'assetsUpdate' || kind === 'assetsEndOfMandate'

export const declarationSchema = z
  .object({
    filedOn: z.iso.date().nullable(),
    kind: declarationKindSchema,
    /** The declaration as the HATVP publishes it; always `null` for assets. */
    pdfUrl: z.url().nullable(),
    publishedOn: z.iso.date().nullable(),
    status: declarationStatusSchema
  })
  .refine(
    (declaration) =>
      !isAssetDeclaration(declaration.kind) || declaration.pdfUrl === null,
    { message: 'An asset declaration is never linked', path: ['pdfUrl'] }
  )

/** A month as the declarations write it, `2024-08`. */
const declaredMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

/** One line of a section, in the declarant's own words. Amounts are left to the PDF. */
export const declaredItemSchema = z.object({
  from: declaredMonthSchema.nullable(),
  /** Declared as kept during the mandate. */
  isKept: z.boolean(),
  /** What the activity, role or holding is; `null` when withheld from publication. */
  label: z.string().min(1).nullable(),
  /** The employer, company or body it is held in. */
  organisation: z.string().min(1).nullable(),
  to: declaredMonthSchema.nullable()
})

const declaredNoneSchema = z.object({ status: z.literal('none') })

/** A section about the declarant: « néant », or the lines declared. */
export const ownSectionSchema = z.discriminatedUnion('status', [
  declaredNoneSchema,
  z.object({ items: z.array(declaredItemSchema), status: z.literal('listed') })
])

/** A section about other people (spouse, collaborators): « néant », or how many are declared. */
export const thirdPartySectionSchema = z.discriminatedUnion('status', [
  declaredNoneSchema,
  z.object({
    count: z.number().int().nonnegative(),
    status: z.literal('listed')
  })
])

/** The sections of a declaration of interests; `INTEREST_SECTION_ORDER` gives the form's order. */
export const interestSectionsSchema = z.object({
  collaborators: thirdPartySectionSchema,
  consulting: ownSectionSchema,
  electedOffices: ownSectionSchema,
  governingBodies: ownSectionSchema,
  observations: ownSectionSchema,
  recentActivities: ownSectionSchema,
  shareholdings: ownSectionSchema,
  spouseActivities: thirdPartySectionSchema,
  volunteerRoles: ownSectionSchema
})

/** The sections in the order the HATVP form numbers them. */
export const INTEREST_SECTION_ORDER = [
  'recentActivities',
  'consulting',
  'governingBodies',
  'shareholdings',
  'spouseActivities',
  'volunteerRoles',
  'electedOffices',
  'collaborators',
  'observations'
] as const satisfies readonly (keyof InterestSections)[]

/** The latest published declaration of interests, section by section. */
export const interestsSummarySchema = z.object({
  filedOn: z.iso.date(),
  kind: z.enum(['interests', 'interestsUpdate']),
  pdfUrl: z.url(),
  sections: interestSectionsSchema
})

/** What the HATVP publishes about one parliamentarian for their current mandate. */
export const hatvpRecordSchema = z.object({
  /** Newest first; the ones with no date yet lead. */
  declarations: z.array(declarationSchema),
  /** `null` when no declaration of interests of this mandate is published. */
  interests: interestsSummarySchema.nullable(),
  /** The person's page on hatvp.fr; `null` when none is known. */
  page: z.url().nullable()
})

export type Declaration = z.infer<typeof declarationSchema>
export type DeclarationKind = z.infer<typeof declarationKindSchema>
export type DeclarationStatus = z.infer<typeof declarationStatusSchema>
export type DeclaredItem = z.infer<typeof declaredItemSchema>
export type HatvpRecord = z.infer<typeof hatvpRecordSchema>
export type InterestSections = z.infer<typeof interestSectionsSchema>
export type InterestsSummary = z.infer<typeof interestsSummarySchema>
export type OwnSection = z.infer<typeof ownSectionSchema>
export type ThirdPartySection = z.infer<typeof thirdPartySectionSchema>
