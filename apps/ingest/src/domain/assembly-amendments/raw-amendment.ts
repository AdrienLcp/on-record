import { z } from 'zod'

import { nilable, oneOrMany } from '@/domain/raw-values.ts'

/** A field the amendments leave out, write as `null` or as an `xsi:nil` object: all three read as `null`. */
const optionalOrNil = <Schema extends z.ZodType>(schema: Schema) =>
  nilable(schema)
    .optional()
    .transform((value) => value ?? null)

/** `json/<file>/<text>/<uid>.json` of the amendments zip, trimmed to what the site shows. */
export const rawAmendmentFileSchema = z.object({
  amendement: z.object({
    corps: optionalOrNil(
      z.object({
        contenuAuteur: optionalOrNil(
          z.object({ exposeSommaire: optionalOrNil(z.string()) })
        )
      })
    ),
    cycleDeVie: z.object({
      dateDepot: optionalOrNil(z.string()),
      etatDesTraitements: z.object({ etat: z.object({ code: z.string() }) }),
      /** A plain string here, unlike the `{ code }` of a scrutin. */
      sort: optionalOrNil(z.string())
    }),
    discussionIdentique: optionalOrNil(
      z.object({ idDiscussion: optionalOrNil(z.string()) })
    ),
    identification: z.object({
      numeroLong: z.string().min(1),
      prefixeOrganeExamen: z.string().min(1)
    }),
    pointeurFragmentTexte: optionalOrNil(
      z.object({
        division: optionalOrNil(
          z.object({ articleDesignationCourte: optionalOrNil(z.string()) })
        )
      })
    ),
    seanceDiscussionRef: optionalOrNil(z.string().min(1)),
    signataires: z.object({
      auteur: z.object({
        acteurRef: optionalOrNil(z.string().min(1)),
        typeAuteur: z.string()
      }),
      /** A list, a bare string for one co-signatory, or nothing. */
      cosignataires: optionalOrNil(
        z.object({ acteurRef: optionalOrNil(oneOrMany(z.string().min(1))) })
      )
    }),
    uid: z.string().min(1)
  })
})

export type RawAmendment = z.output<typeof rawAmendmentFileSchema>['amendement']
