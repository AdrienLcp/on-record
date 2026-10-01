import type React from 'react'
import { StrictMode } from 'react'

import { BrowserRouterProvider } from '@/infrastructure/router/browser-router'
import { AppProviders } from '@/presentation/app-providers'

export const App: React.FC = () => (
  <StrictMode>
    <AppProviders>
      <BrowserRouterProvider />
    </AppProviders>
  </StrictMode>
)
