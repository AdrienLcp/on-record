import { createSafeContext } from '@adrienlcp/react'

import type { Translate } from './translation'

type I18nContextValue = {
  translate: Translate
}

/**
 * Kept apart from the dictionary: editing it in dev reloads every module that
 * imports it, and a context created there would be a new one the mounted
 * provider no longer supplies.
 */
export const [I18nContext, useI18n] =
  createSafeContext<I18nContextValue>('I18nProvider')
