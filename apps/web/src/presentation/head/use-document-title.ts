import { useEffect } from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

/**
 * The tab names the page first, then the site: on a phone only the start of
 * a title shows. A client-side navigation replaces no head on its own.
 */
export const useDocumentTitle = (page: string | null): void => {
  const translate = useTranslate()
  const siteName = translate('common.siteName')

  useEffect(() => {
    if (page !== null) {
      document.title = `${page} — ${siteName}`
    }
  }, [page, siteName])
}
