import { useEffect } from 'react'

import { useCurrentPath } from '@/infrastructure/router/navigation'
import { SITE_ORIGIN } from '@/presentation/head/site-origin'

const servedCanonicalLink = (): HTMLLinkElement => {
  const served = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  )

  if (served !== null) {
    return served
  }

  const link = document.createElement('link')
  link.rel = 'canonical'

  return document.head.appendChild(link)
}

/**
 * Points the canonical link at the page shown. The home document is served
 * without one, since the host also answers every client-rendered path with
 * it; once a script runs, the path is known, and a crawler that renders the
 * page reads its own address, while a client-side navigation leaves no stale
 * one behind.
 */
export const useCanonicalLink = (): void => {
  const path = useCurrentPath()

  useEffect(() => {
    servedCanonicalLink().href = `${SITE_ORIGIN}${path}`
  }, [path])
}
