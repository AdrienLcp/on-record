import { searchableText } from '@/helpers/search-text'

import type { Commune } from './commune'

const POSTCODE_START = /^\d{2,5}$/

/** Below two characters, every commune would match. */
export const MIN_QUERY_LENGTH = 2

/** How well a commune answers the query: lower is better, `null` is no match. */
const nameRankOf = (searchName: string, query: string): number | null => {
  if (searchName === query) return 0
  if (searchName.startsWith(query)) return 1
  if (searchName.split(' ').some((word) => word.startsWith(query))) return 2
  return searchName.includes(query) ? 3 : null
}

const postcodeRankOf = (commune: Commune, query: string): number | null => {
  if (commune.postcodes.includes(query)) return 0
  return commune.postcodes.some((postcode) => postcode.startsWith(query))
    ? 1
    : null
}

/**
 * The communes a search box should offer for what was typed: a name without
 * accents, case or hyphens (`saint etienne` finds `Saint-Étienne`), or the
 * start of a postcode (`750` finds Paris). Exact matches first, then names
 * starting with the query, then shorter names. Every commune of a full
 * postcode is offered, beyond `limit`: the visitor must find theirs.
 */
export const searchCommunes = ({
  communes,
  limit,
  query
}: {
  communes: readonly Commune[]
  limit: number
  query: string
}): Commune[] => {
  const trimmed = query.trim()
  const isPostcode = POSTCODE_START.test(trimmed)
  const searched = isPostcode ? trimmed : searchableText(trimmed)

  if (searched.length < MIN_QUERY_LENGTH) {
    return []
  }

  const ranked = communes
    .flatMap((commune) => {
      const rank = isPostcode
        ? postcodeRankOf(commune, searched)
        : nameRankOf(commune.searchName, searched)

      return rank === null ? [] : [{ commune, rank }]
    })
    .toSorted(
      (first, second) =>
        first.rank - second.rank ||
        first.commune.name.length - second.commune.name.length ||
        first.commune.name.localeCompare(second.commune.name, 'fr')
    )
  const exactPostcodeMatches = isPostcode
    ? ranked.filter(({ rank }) => rank === 0).length
    : 0

  return ranked
    .slice(0, Math.max(limit, exactPostcodeMatches))
    .map(({ commune }) => commune)
}
