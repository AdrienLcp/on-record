import { useEffect } from 'react'

import { documentTitleFor } from './page-heads'

/**
 * The tab after a client-side navigation, which replaces no head on its own:
 * a served document already carries its title.
 */
export const useDocumentTitle = (page: string | null): void => {
  useEffect(() => {
    if (page !== null) {
      document.title = documentTitleFor(page)
    }
  }, [page])
}
