import type { Senator } from '@on-record/protocol/senate/senator'

import type { DeputyScope } from '@/features/deputies/deputy-search'
import { matchesQuery } from '@/helpers/search-text'

import {
  isSenatorSitting,
  latestSenateGroupIdOf,
  senatorFullNameOf
} from './senator'

export type SenatorFilters = {
  /** Today's group (the last one of a senator who left), or `null` for all. */
  groupId: string | null
  query: string
  /** Sitting today, or those who left since October 2023 too. */
  scope: DeputyScope
}

export const filterSenators = ({
  filters,
  senators
}: {
  filters: SenatorFilters
  senators: readonly Senator[]
}): Senator[] =>
  senators.filter(
    (senator) =>
      (filters.scope === 'all' || isSenatorSitting(senator)) &&
      (filters.groupId === null ||
        latestSenateGroupIdOf(senator) === filters.groupId) &&
      matchesQuery({ query: filters.query, text: senatorFullNameOf(senator) })
  )
