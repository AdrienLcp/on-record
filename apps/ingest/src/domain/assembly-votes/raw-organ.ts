import { z } from 'zod'

import { organIdSchema } from '@on-record/protocol/assembly/official-ids.ts'

import { LEGISLATURE_CODE } from '@/domain/assembly-votes/assembly-sources.ts'
import { nilable } from '@/domain/assembly-votes/raw-values.ts'

const GROUP_ORGAN_TYPE = 'GP'

const organScreenSchema = z.object({
  organe: z.object({ codeType: z.unknown(), legislature: z.unknown() })
})

/**
 * Whether an organ file is a political group of the legislature. The zips
 * hold thousands of other organs (committees, delegations, past groups).
 */
export const isLegislatureGroupFile = (file: unknown): boolean => {
  const screened = organScreenSchema.safeParse(file)
  return (
    screened.success &&
    screened.data.organe.codeType === GROUP_ORGAN_TYPE &&
    screened.data.organe.legislature === LEGISLATURE_CODE
  )
}

/** `json/organe/PO<n>.json` of a political group of the legislature. */
export const rawGroupFileSchema = z.object({
  organe: z.object({
    codeType: z.literal(GROUP_ORGAN_TYPE),
    couleurAssociee: nilable(z.string().min(1)),
    legislature: z.literal(LEGISLATURE_CODE),
    libelle: z.string().min(1),
    libelleAbrege: z.string().min(1),
    uid: organIdSchema,
    viMoDe: z.object({
      dateDebut: z.iso.date(),
      dateFin: nilable(z.iso.date())
    })
  })
})

export type RawGroup = z.output<typeof rawGroupFileSchema>['organe']
