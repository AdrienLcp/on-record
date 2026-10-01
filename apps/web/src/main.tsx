import { createRoot } from 'react-dom/client'

import { App } from '@/presentation/app'

import '@/presentation/styles/globals.sass'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Missing #root in index.html')
}

createRoot(container).render(<App />)
