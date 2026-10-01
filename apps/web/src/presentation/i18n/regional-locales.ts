import type { Locale } from './locale.ts'

export const REGIONAL_LOCALES = {
  fr: 'fr-FR'
} as const satisfies Record<Locale, string>
