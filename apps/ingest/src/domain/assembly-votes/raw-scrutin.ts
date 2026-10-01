import { z } from 'zod'

import {
  deputyIdSchema,
  organIdSchema
} from '@on-record/protocol/assembly/official-ids.ts'

import {
  booleanString,
  integerString,
  nilable,
  oneOrMany
} from '@/domain/raw-values.ts'

const recordedVoterSchema = z.object({
  acteurRef: deputyIdSchema,
  causePositionVote: z
    .string()
    .min(1)
    .nullish()
    .transform((cause) => cause ?? null),
  parDelegation: booleanString
})

/** A nominal list: `null` when empty, a bare object when it holds one voter. */
const recordedBucketSchema = nilable(
  z.object({ votant: oneOrMany(recordedVoterSchema) })
).transform((bucket) => (bucket === null ? [] : bucket.votant))

const declaredVoterSchema = z.object({ acteurRef: deputyIdSchema })

/**
 * A "mise au point" list. On top of the nominal-list traps, some are wrapped
 * in an array padded with `null`s (`[null, { votant }]`).
 */
const declaredBucketSchema = oneOrMany(
  nilable(z.object({ votant: oneOrMany(declaredVoterSchema) }))
).transform((buckets) =>
  buckets.flatMap((bucket) => (bucket === null ? [] : bucket.votant))
)

const voteCountSchema = z.object({
  abstentions: integerString,
  contre: integerString,
  nonVotants: integerString,
  pour: integerString
})

const rawGroupVoteSchema = z.object({
  nombreMembresGroupe: integerString,
  organeRef: organIdSchema,
  vote: z.object({
    decompteNominatif: z.object({
      abstentions: recordedBucketSchema,
      contres: recordedBucketSchema,
      nonVotants: recordedBucketSchema,
      pours: recordedBucketSchema
    }),
    decompteVoix: voteCountSchema,
    positionMajoritaire: z.enum(['abstention', 'contre', 'pour'])
  })
})

/** `json/VTANR5L17V<n>.json` of the Scrutins zip, its traps normalised. */
export const rawScrutinFileSchema = z.object({
  scrutin: z.object({
    dateScrutin: z.iso.date(),
    demandeur: z.object({ texte: nilable(z.string().min(1)) }),
    miseAuPoint: z.object({
      abstentions: declaredBucketSchema,
      contres: declaredBucketSchema,
      /** Votes a deputy says the voting system failed to record as cast. */
      dysfonctionnement: z.object({
        abstentions: declaredBucketSchema,
        contre: declaredBucketSchema,
        nonVotants: declaredBucketSchema,
        nonVotantsVolontaires: declaredBucketSchema,
        pour: declaredBucketSchema
      }),
      nonVotants: declaredBucketSchema,
      nonVotantsVolontaires: declaredBucketSchema,
      pours: declaredBucketSchema
    }),
    numero: integerString,
    objet: z.object({
      dossierLegislatif: nilable(z.object({ dossierRef: z.string().min(1) }))
    }),
    sort: z.object({ code: z.enum(['adopté', 'rejeté']) }),
    syntheseVote: z.object({ decompte: voteCountSchema }),
    titre: z.string().min(1),
    typeVote: z.object({ codeTypeVote: z.enum(['MOC', 'SPO', 'SPS']) }),
    ventilationVotes: z.object({
      organe: z.object({
        groupes: z.object({ groupe: oneOrMany(rawGroupVoteSchema) })
      })
    })
  })
})

export type RawScrutin = z.output<typeof rawScrutinFileSchema>['scrutin']
export type RawGroupVote = z.output<typeof rawGroupVoteSchema>
export type RawVoteCount = z.output<typeof voteCountSchema>
