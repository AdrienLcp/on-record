import { z } from 'zod'

import {
  deputyIdSchema,
  organIdSchema
} from '@on-record/protocol/assembly/official-ids.ts'

import { LEGISLATURE_CODE } from '@/domain/assembly-votes/assembly-sources.ts'
import {
  integerString,
  nilable,
  oneOrMany
} from '@/domain/assembly-votes/raw-values.ts'

const SEAT_ORGAN_TYPE = 'ASSEMBLEE'
const GROUP_ORGAN_TYPE = 'GP'

const mandateHeaderSchema = z.object({
  legislature: z.unknown(),
  typeOrgane: z.unknown()
})

type MandateHeader = z.output<typeof mandateHeaderSchema>

const isLegislatureMandate = (
  mandate: MandateHeader,
  organType: string
): boolean =>
  mandate.typeOrgane === organType && mandate.legislature === LEGISLATURE_CODE

/** A seat in the chamber during the legislature, with the constituency it was won in. */
const seatMandateSchema = z
  .object({
    dateDebut: z.iso.date(),
    dateFin: nilable(z.iso.date()),
    election: z.object({
      lieu: z.object({
        departement: z.string().min(1),
        numCirco: integerString,
        numDepartement: z.string().min(1)
      })
    }),
    legislature: z.literal(LEGISLATURE_CODE),
    /** `datePriseFonction` is when the deputy actually took the seat: a minister back in the chamber keeps the election day as `dateDebut`. */
    mandature: z.object({ datePriseFonction: nilable(z.iso.date()) }),
    typeOrgane: z.literal(SEAT_ORGAN_TYPE)
  })
  .transform((mandate) => ({ ...mandate, kind: 'seat' as const }))

/** A spell in a political group; the Assemblée repeats it once per role held. */
const groupMandateSchema = z
  .object({
    dateDebut: z.iso.date(),
    dateFin: nilable(z.iso.date()),
    legislature: z.literal(LEGISLATURE_CODE),
    organes: z.object({ organeRef: organIdSchema }),
    typeOrgane: z.literal(GROUP_ORGAN_TYPE)
  })
  .transform((mandate) => ({ ...mandate, kind: 'group' as const }))

const otherMandateSchema = mandateHeaderSchema
  .refine(
    (mandate) =>
      !isLegislatureMandate(mandate, SEAT_ORGAN_TYPE) &&
      !isLegislatureMandate(mandate, GROUP_ORGAN_TYPE),
    'A seat or group mandate of the legislature has an unexpected shape'
  )
  .transform(() => ({ kind: 'other' as const }))

const rawMandateSchema = z.union([
  seatMandateSchema,
  groupMandateSchema,
  otherMandateSchema
])

/** Just enough of an actor file to tell whether it held a seat in the legislature. */
const actorScreenSchema = z.object({
  acteur: z.object({
    mandats: z.object({ mandat: oneOrMany(mandateHeaderSchema) })
  })
})

/**
 * Whether an actor file belongs to a deputy of the legislature. The history
 * zip holds thousands of other actors whose files are not parsed further.
 */
export const isLegislatureDeputyFile = (file: unknown): boolean => {
  const screened = actorScreenSchema.safeParse(file)
  return (
    screened.success &&
    screened.data.acteur.mandats.mandat.some((mandate) =>
      isLegislatureMandate(mandate, SEAT_ORGAN_TYPE)
    )
  )
}

/** `json/acteur/PA<n>.json` of a deputy of the legislature, its traps normalised. */
export const rawDeputyFileSchema = z.object({
  acteur: z.object({
    etatCivil: z.object({
      ident: z.object({
        civ: z.enum(['M.', 'Mme']),
        nom: z.string().min(1),
        prenom: z.string().min(1)
      }),
      infoNaissance: z.object({ dateNais: nilable(z.iso.date()) })
    }),
    mandats: z.object({ mandat: oneOrMany(rawMandateSchema) }),
    profession: z.object({ libelleCourant: nilable(z.string().min(1)) }),
    uid: z.object({ '#text': deputyIdSchema }),
    uri_hatvp: nilable(z.url())
  })
})

export type RawDeputy = z.output<typeof rawDeputyFileSchema>['acteur']
export type RawMandate = z.output<typeof rawMandateSchema>
