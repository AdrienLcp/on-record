import { z } from 'zod'

import { integerString } from '@/domain/raw-values.ts'

const digits = z.string().regex(/^\d+$/)

/** A line of the Ministry's table: one commune, or one canton of a commune. */
export const rawTableRowSchema = z.object({
  'CODE CIRC LEGISLATIVE': integerString,
  'CODE COMMUNE': digits,
  'CODE DPT': z.string().regex(/^(\d{1,2}|2[AB]|Z[A-Z])$/)
})

/** A line of `v_commune_<year>.csv`: a commune, an arrondissement, a delegated or associated commune. */
export const rawCommuneSchema = z.object({
  CAN: z.string(),
  COM: z.string().min(5),
  COMPARENT: z.string(),
  DEP: z.string(),
  LIBELLE: z.string().min(1),
  TYPECOM: z.enum(['ARM', 'COM', 'COMA', 'COMD'])
})

/** A line of `v_commune_comer_<year>.csv`. Wallis-et-Futuna's kingdoms are `CIR`. */
export const rawOverseasCommuneSchema = z.object({
  COM_COMER: z.string().min(5),
  COMER: z.string().min(3),
  LIBELLE: z.string().min(1),
  NATURE_ZONAGE: z.string().min(1)
})

/** A line of `v_mvt_commune_<year>.csv`: one code before an event, one after. */
export const rawCommuneMoveSchema = z.object({
  COM_AP: z.string(),
  COM_AV: z.string(),
  DATE_EFF: z.iso.date(),
  TYPECOM_AP: z.string(),
  TYPECOM_AV: z.string()
})

/** A line of La Poste's file: a commune, or one of its places, and its postcode. */
export const rawPostcodeSchema = z.object({
  '#Code_commune_INSEE': z.string().min(5),
  Code_postal: z.string().regex(/^\d{5}$/)
})

const positionSchema = z.tuple([z.number(), z.number()])
const polygonCoordinatesSchema = z.array(z.array(positionSchema))

/** The constituency contours published on data.gouv.fr, as GeoJSON. */
export const rawContoursSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.discriminatedUnion('type', [
        z.object({
          coordinates: polygonCoordinatesSchema,
          type: z.literal('Polygon')
        }),
        z.object({
          coordinates: z.array(polygonCoordinatesSchema),
          type: z.literal('MultiPolygon')
        })
      ]),
      properties: z.object({
        codeCirconscription: z.string().regex(/^\w{2}\d{2}$/),
        codeDepartement: z.string().min(2)
      })
    })
  )
})

export type RawContours = z.output<typeof rawContoursSchema>
