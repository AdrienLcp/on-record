import type React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { routes } from './routes'

const router = createBrowserRouter(routes)

export const BrowserRouterProvider: React.FC = () => (
  <RouterProvider router={router} />
)

const whenInitialized = (): Promise<void> =>
  new Promise((resolve) => {
    if (router.state.initialized) {
      resolve()
      return
    }

    const unsubscribe = router.subscribe((state) => {
      if (state.initialized) {
        unsubscribe()
        resolve()
      }
    })
  })

/**
 * `use` suspends on a promise it has never seen, even one already resolved.
 * Tagged the way React tracks a settled promise, the loaders' data reads at
 * once on the first render, which is what hydration compares with the page.
 */
const markAsSettledForReactUse = (promise: Promise<unknown>) =>
  promise.then(
    (value) => Object.assign(promise, { status: 'fulfilled', value }),
    () => undefined
  )

const pendingLoaderData = (): Promise<unknown>[] =>
  Object.values(router.state.loaderData)
    .flatMap((data: unknown) =>
      typeof data === 'object' && data !== null ? Object.values(data) : []
    )
    .filter((value): value is Promise<unknown> => value instanceof Promise)

/**
 * Every route is `lazy` and its data is downloading: rendered before both
 * arrive, the first render would be the route fallback or a loading line,
 * which hydration cannot match against a prerendered page. An empty `#root`
 * (the SPA fallback) has nothing to match, so it renders without waiting.
 */
export const routerReadyForPrerenderedPage = async (): Promise<void> => {
  await whenInitialized()
  await Promise.all(pendingLoaderData().map(markAsSettledForReactUse))
}
