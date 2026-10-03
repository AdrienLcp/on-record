import { createRoot, hydrateRoot } from 'react-dom/client'

import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import { routerReadyForPrerenderedPage } from '@/infrastructure/router/browser-router'
import {
  prerenderedMarkupOf,
  writtenFromTheServedDatasets
} from '@/infrastructure/router/prerendered-markup'
import { App } from '@/presentation/app'

import '@/presentation/styles/globals.sass'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Missing #root in index.html')
}

/** Read once the router is ready, it is the root loader's file, already kept. */
const servedDatasetsGeneratedAt = async (): Promise<string | undefined> => {
  const meta = await fetchDatasetsMeta(new AbortController().signal)

  return meta.status === 'success' ? meta.data.generatedAt : undefined
}

const markup = prerenderedMarkupOf(container)

if (markup !== 'absent') {
  await routerReadyForPrerenderedPage()
}

if (
  markup === 'hydratable' &&
  writtenFromTheServedDatasets({
    container,
    servedDatasetsGeneratedAt: await servedDatasetsGeneratedAt()
  })
) {
  hydrateRoot(container, <App />)
} else {
  createRoot(container).render(<App />)
}
