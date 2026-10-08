import { createI18n } from '@adrienlcp/i18n'

import { FR_DICTIONARY } from './dictionary-fr.ts'
import { LOCALE } from './locale.ts'

export const i18n = createI18n({
  defaultLocale: LOCALE,
  dictionaries: { fr: FR_DICTIONARY }
})
