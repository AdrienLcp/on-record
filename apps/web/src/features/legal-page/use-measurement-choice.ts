import { useState, useSyncExternalStore } from 'react'

import { sendsGlobalPrivacyControl } from '@/infrastructure/browser'
import {
  ANALYTICS_OPT_OUT_KEY,
  readAnalyticsOptOut,
  writeAnalyticsOptOut
} from '@/infrastructure/storage/analytics-opt-out-storage'

/**
 * Whether this browser's visits are counted: by the visitor's choice here,
 * by Global Privacy Control, or not at all where storage is blocked.
 */
export type MeasurementChoice =
  | 'counted'
  | 'refused'
  | 'refused-by-browser'
  | 'storage-blocked'

const readMeasurementChoice = (): MeasurementChoice => {
  if (sendsGlobalPrivacyControl()) {
    return 'refused-by-browser'
  }

  const optOut = readAnalyticsOptOut()

  if (optOut.status === 'failure') {
    return 'storage-blocked'
  }

  return optOut.data ? 'refused' : 'counted'
}

/**
 * The prerendered page cannot know the visitor's choice: it shows the
 * default, and hydration reads the real one.
 */
const choiceBeforeHydration = (): MeasurementChoice => 'counted'

const listeners = new Set<() => void>()

const notifyListeners = (): void => {
  for (const listener of listeners) {
    listener()
  }
}

/** Follows this tab's writes, and another tab's through the `storage` event. */
const subscribe = (onChange: () => void): (() => void) => {
  const onStorage = (event: StorageEvent): void => {
    if (event.key === null || event.key === ANALYTICS_OPT_OUT_KEY) {
      onChange()
    }
  }

  listeners.add(onChange)
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

export const useMeasurementChoice = () => {
  const choice = useSyncExternalStore(
    subscribe,
    readMeasurementChoice,
    choiceBeforeHydration
  )
  const [hasSaveFailed, setHasSaveFailed] = useState(false)

  const setCounted = (isCounted: boolean): void => {
    const saved = writeAnalyticsOptOut(!isCounted)

    setHasSaveFailed(saved.status === 'failure')
    notifyListeners()
  }

  return { choice, hasSaveFailed, setCounted }
}
