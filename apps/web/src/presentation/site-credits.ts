import type { Locale } from '@/presentation/i18n/locale'

/** The author every page credits in its footer, linked to his site in the reader's language. */
export const AUTHOR = {
  name: 'Adrien Lacourpaille',
  siteHref: {
    fr: 'https://adrienlcp.com/fr'
  }
} as const satisfies { name: string; siteHref: Record<Locale, string> }

/**
 * The project's public repository, linked from the footer. `null` when the
 * source is private: the footer then links none.
 */
export const SOURCE_REPOSITORY_HREF: string | null =
  'https://github.com/AdrienLcp/on-record'
