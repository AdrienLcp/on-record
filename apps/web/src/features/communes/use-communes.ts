import { useEffect, useState } from 'react'

import type { DatasetError } from '@/infrastructure/api/datasets-api'

import type { Commune } from './commune'
import { fetchCommunes } from './communes-api'

/**
 * - `idle` — nobody searched yet: the index is not downloaded
 * - `loading` — downloading the index
 * - `ready` — every commune, to search in
 * - `failed` — the index could not be read
 */
export type CommunesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { communes: Commune[]; status: 'ready' }
  | { error: Exclude<DatasetError, 'aborted'>; status: 'failed' }

/**
 * The commune index, downloaded once `isWanted` turns true — when someone
 * starts to search; it never turns back — and kept for the visit.
 */
export const useCommunes = (isWanted: boolean): CommunesState => {
  const [state, setState] = useState<CommunesState>({ status: 'idle' })
  useEffect(() => {
    if (!isWanted) {
      return
    }

    const controller = new AbortController()
    setState({ status: 'loading' })

    void fetchCommunes(controller.signal).then((communes) => {
      if (communes.status === 'success') {
        setState({ communes: communes.data, status: 'ready' })
      } else if (communes.error === 'aborted') {
        setState({ status: 'idle' })
      } else {
        setState({ error: communes.error, status: 'failed' })
      }
    })

    return () => controller.abort()
  }, [isWanted])

  return state
}
