import { useEffect, useState } from 'react'

import {
  type AddressMatch,
  type AddressSearchError,
  searchAddresses
} from '@/infrastructure/base-adresse/base-adresse-client'

/** Waits for a pause in typing before asking the geocoder. */
const TYPING_PAUSE_BEFORE_SEARCH_MS = 250

/** The geocoder needs a few letters to answer anything useful. */
const MIN_ADDRESS_LENGTH = 3

/**
 * - `idle` — not enough typed to search
 * - `searching` — a request is out for what was typed last
 * - `found` — the geocoder's suggestions, possibly none
 * - `failed` — the geocoder could not be reached
 */
export type AddressSearch =
  | { status: 'idle' }
  | { status: 'searching' }
  | { matches: AddressMatch[]; status: 'found' }
  | { error: Exclude<AddressSearchError, 'aborted'>; status: 'failed' }

/**
 * Suggestions for an address typed inside one commune. A newer keystroke
 * aborts the request still out, so a slow answer never replaces a newer one.
 */
export const useAddressSearch = ({
  communeCode,
  query
}: {
  communeCode: string
  query: string
}): AddressSearch => {
  const [search, setSearch] = useState<AddressSearch>({ status: 'idle' })

  useEffect(() => {
    if (query.trim().length < MIN_ADDRESS_LENGTH) {
      setSearch({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    setSearch({ status: 'searching' })
    const timer = setTimeout(async () => {
      const matches = await searchAddresses({
        communeCode,
        query,
        signal: controller.signal
      })

      if (matches.status === 'success') {
        setSearch({ matches: matches.data, status: 'found' })
      } else if (matches.error !== 'aborted') {
        setSearch({ error: matches.error, status: 'failed' })
      }
    }, TYPING_PAUSE_BEFORE_SEARCH_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [communeCode, query])

  return search
}
