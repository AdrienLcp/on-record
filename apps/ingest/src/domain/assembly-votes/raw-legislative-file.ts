import { z } from 'zod'

import { nilable, oneOrMany } from '@/domain/raw-values.ts'

/** One step of a file (a filing, a committee report, a sitting's decision), with its sub-steps. */
type RawAct = {
  actesLegislatifs: RawAct[]
  /** Uids of the scrutins the step decided by (`VTANR5L17V<n>`). */
  voteRefs: string[]
}

const actListSchema = (
  actSchema: z.ZodType<RawAct>
): z.ZodType<RawAct[], unknown> =>
  nilable(z.object({ acteLegislatif: oneOrMany(actSchema) })).transform(
    (list) => (list === null ? [] : list.acteLegislatif)
  )

const rawActSchema: z.ZodType<RawAct, unknown> = z.object({
  get actesLegislatifs() {
    return actListSchema(rawActSchema)
  },
  voteRefs: nilable(z.object({ voteRef: oneOrMany(z.string().min(1)) }))
    .optional()
    .transform((refs) => refs?.voteRef ?? [])
})

/** `json/dossierParlementaire/<uid>.json` of the legislative files zip. */
export const rawLegislativeFileSchema = z.object({
  dossierParlementaire: z.object({
    actesLegislatifs: actListSchema(rawActSchema),
    titreDossier: z.object({ titre: z.string().min(1) }),
    uid: z.string().min(1)
  })
})

export type RawLegislativeFile = z.output<
  typeof rawLegislativeFileSchema
>['dossierParlementaire']
export type { RawAct }
