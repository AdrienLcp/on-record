import { createRoot, hydrateRoot } from 'react-dom/client'

import { routerReadyForPrerenderedPage } from '@/infrastructure/router/browser-router'
import { prerenderedMarkupOf } from '@/infrastructure/router/prerendered-markup'
import { App } from '@/presentation/app'

import '@/presentation/styles/globals.sass'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Missing #root in index.html')
}

const markup = prerenderedMarkupOf(container)

if (markup !== 'absent') {
  await routerReadyForPrerenderedPage()
}

if (markup === 'hydratable') {
  hydrateRoot(container, <App />)
} else {
  createRoot(container).render(<App />)
}
