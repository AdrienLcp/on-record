import type {
  MissingSenateScrutin,
  SenateScrutinSummary
} from '@on-record/protocol/senate/senate-scrutin'

import type {
  KindFilter,
  OutcomeFilter
} from '@/features/scrutins/scrutin-search'
import { matchesQuery } from '@/helpers/search-text'

/** The Senate votes no motion of censure: no tab for one. */
export const SENATE_KIND_FILTERS = [
  'all',
  'solemn',
  'ordinary'
] as const satisfies readonly KindFilter[]

export type SenateKindFilter = (typeof SENATE_KIND_FILTERS)[number]

export const parseSenateKindFilter = (value: string | null): SenateKindFilter =>
  SENATE_KIND_FILTERS.find((kind) => kind === value) ?? 'all'

export const filterSenateScrutins = ({
  filters,
  scrutins
}: {
  filters: { kind: SenateKindFilter; outcome: OutcomeFilter; query: string }
  scrutins: readonly SenateScrutinSummary[]
}): SenateScrutinSummary[] =>
  scrutins.filter(
    (scrutin) =>
      (filters.kind === 'all' || scrutin.kind === filters.kind) &&
      (filters.outcome === 'all' || scrutin.outcome === filters.outcome) &&
      matchesQuery({
        query: filters.query,
        text: `${scrutin.title} ${scrutin.legislativeFile?.title ?? ''}`
      })
  )

/** Newest session first, then newest number. */
export const newestMissingFirst = (
  missing: readonly MissingSenateScrutin[]
): MissingSenateScrutin[] =>
  missing.toSorted(
    (first, second) =>
      second.session - first.session || second.number - first.number
  )
