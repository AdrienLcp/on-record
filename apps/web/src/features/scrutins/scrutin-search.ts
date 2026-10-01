import type {
  ScrutinKind,
  ScrutinOutcome,
  ScrutinSummary
} from '@on-record/protocol/assembly/scrutin'

import { matchesQuery } from '@/helpers/search-text'

export type KindFilter = 'all' | ScrutinKind

export type OutcomeFilter = 'all' | ScrutinOutcome

/** In the order the tabs show them: the votes people recognise first. */
export const KIND_FILTERS = [
  'all',
  'solemn',
  'censure',
  'ordinary'
] as const satisfies readonly KindFilter[]

export const OUTCOME_FILTERS = [
  'all',
  'adopted',
  'rejected'
] as const satisfies readonly OutcomeFilter[]

export const parseKindFilter = (value: string | null): KindFilter =>
  KIND_FILTERS.find((kind) => kind === value) ?? 'all'

export const parseOutcomeFilter = (value: string | null): OutcomeFilter =>
  OUTCOME_FILTERS.find((outcome) => outcome === value) ?? 'all'

export const filterScrutins = ({
  filters,
  scrutins
}: {
  filters: { kind: KindFilter; outcome: OutcomeFilter; query: string }
  scrutins: readonly ScrutinSummary[]
}): ScrutinSummary[] =>
  scrutins.filter(
    (scrutin) =>
      (filters.kind === 'all' || scrutin.kind === filters.kind) &&
      (filters.outcome === 'all' || scrutin.outcome === filters.outcome) &&
      matchesQuery({ query: filters.query, text: scrutin.title })
  )

/** Newest first, whatever order the index arrived in. */
export const newestFirst = (
  scrutins: readonly ScrutinSummary[]
): ScrutinSummary[] =>
  scrutins.toSorted((first, second) => second.number - first.number)

/** The most recent votes people recognise: solemn votes and motions of censure. */
export const latestMajorScrutins = ({
  count,
  scrutins
}: {
  count: number
  scrutins: readonly ScrutinSummary[]
}): ScrutinSummary[] =>
  newestFirst(scrutins)
    .filter((scrutin) => scrutin.kind !== 'ordinary')
    .slice(0, count)
