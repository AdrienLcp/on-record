import type { Deputy } from '@on-record/protocol/assembly/deputy'

import { matchesQuery } from '@/helpers/search-text'

import { fullNameOf, isSitting, latestGroupIdOf } from './deputy'

/**
 * - `sitting` — those who hold a seat today
 * - `all` — those who left during the legislature too
 */
export type DeputyScope = 'all' | 'sitting'

export type DeputyFilters = {
  /** A department code, or `null` for all. */
  departmentCode: string | null
  /** Today's group (the last one of a deputy who left), or `null` for all. */
  groupId: string | null
  query: string
  scope: DeputyScope
}

export const parseDeputyScope = (value: string | null): DeputyScope =>
  value === 'all' ? 'all' : 'sitting'

export const filterDeputies = ({
  deputies,
  filters
}: {
  deputies: readonly Deputy[]
  filters: DeputyFilters
}): Deputy[] =>
  deputies.filter(
    (deputy) =>
      (filters.scope === 'all' || isSitting(deputy)) &&
      (filters.groupId === null ||
        latestGroupIdOf(deputy) === filters.groupId) &&
      (filters.departmentCode === null ||
        deputy.department.code === filters.departmentCode) &&
      matchesQuery({ query: filters.query, text: fullNameOf(deputy) })
  )

export type Department = Deputy['department']

const DEPARTMENT_CODE_ORDER = new Intl.Collator('fr', { numeric: true })

/** Each department that has a deputy, once, in the order of their codes. */
export const departmentsOf = (deputies: readonly Deputy[]): Department[] =>
  [
    ...new Map(
      deputies.map((deputy) => [deputy.department.code, deputy.department])
    ).values()
  ].toSorted((first, second) =>
    DEPARTMENT_CODE_ORDER.compare(first.code, second.code)
  )
