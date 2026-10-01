import { prerender } from 'react-dom/static'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider
} from 'react-router'

import { AppProviders } from '@/presentation/app-providers'

import { routes } from './routes'

const handler = createStaticHandler(routes)

const WAIT_FOR_EVERY_BOUNDARY_IN_PLACE = {
  progressiveChunkSize: Number.POSITIVE_INFINITY
}

/**
 * A region still waiting paints a loading line, and React marks a boundary it
 * left pending (`$?`) or gave up on (`$!`). An empty `<template>` alone is
 * react-aria building a collection, not a wait.
 */
const PENDING_MARKERS = ['aria-busy="true"', '<!--$?-->', '<!--$!-->']

/**
 * `prerender` rather than `renderToStaticMarkup`: loaders hand back unawaited
 * promises read with `use`, and only `prerender` waits for every Suspense
 * boundary to resolve instead of writing its fallback into the document.
 * No router state goes into the page: the browser reads the same datasets
 * before it hydrates.
 */
export const prerenderPath = async (path: string): Promise<string> => {
  const context = await handler.query(new Request(`http://prerender${path}`))

  if (context instanceof Response) {
    throw new Error(
      `${path} answered with ${context.status} rather than with a page`
    )
  }

  const { prelude } = await prerender(
    <AppProviders>
      <StaticRouterProvider
        context={context}
        hydrate={false}
        router={createStaticRouter(handler.dataRoutes, context)}
      />
    </AppProviders>,
    WAIT_FOR_EVERY_BOUNDARY_IN_PLACE
  )
  const html = await new Response(prelude).text()

  if (PENDING_MARKERS.some((marker) => html.includes(marker))) {
    throw new Error(`${path} rendered a pending state rather than its content`)
  }

  return html
}
