import { prefersReducedMotion } from '@adrienlcp/browser'
import { AriaRouterProvider } from '@adrienlcp/react-router'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
  type Location,
  Outlet,
  ScrollRestoration,
  useLocation
} from 'react-router'

import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import { useRouteData } from '@/infrastructure/router/navigation'
import { AppShell } from '@/presentation/app-shell'
import { focusMain } from '@/presentation/components/main'
import { SiteFooter } from '@/presentation/site-footer'
import { SiteHeader } from '@/presentation/site-header'

/** What every page's frame shows, whichever page is inside it. */
export const rootLoader = ({ signal }: { signal: AbortSignal }) => ({
  meta: fetchDatasetsMeta(signal)
})

/**
 * A client-side navigation leaves focus on the link that started it, in a
 * header that did not change: the new page is announced by nothing. Focus
 * moves to the new page instead; a full load starts at the top on its own.
 * A filter written into the query string keeps the same path, and focus.
 */
const useFocusMainOnNavigation = (): void => {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return
    }

    previousPathname.current = pathname
    focusMain({ preventScroll: true })
  }, [pathname])
}

/**
 * Every page opened by a full load shares the location key `default`, so the
 * router would restore the scroll of whichever page was loaded last in this
 * tab onto a shared link. Such a page is remembered by its address instead.
 */
const scrollKeyOf = (location: Location): string =>
  location.key === 'default' ? location.pathname : location.key

export const RootRoute: React.FC = () => {
  useFocusMainOnNavigation()
  const { meta } = useRouteData<typeof rootLoader>()

  return (
    <AriaRouterProvider
      navigateDefaults={() => ({ viewTransition: !prefersReducedMotion() })}
    >
      <AppShell footer={<SiteFooter meta={meta} />} header={<SiteHeader />}>
        <Outlet />
      </AppShell>
      <ScrollRestoration getKey={scrollKeyOf} />
    </AriaRouterProvider>
  )
}
