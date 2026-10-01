import type React from 'react'

import { paths, useRouteFailure } from '@/infrastructure/router/navigation'
import { AppShell } from '@/presentation/app-shell'
import { Main } from '@/presentation/components/main'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './error-screen.sass'

/**
 * Sits outside react-aria's router provider, so its link is a whole document
 * load — which is also what clears a half-broken state.
 */
export const ErrorScreen: React.FC = () => {
  const translate = useTranslate()
  const failure = useRouteFailure()

  return (
    <AppShell>
      <Main className='error-screen'>
        <h1 className='error-title'>{translate('error.title')}</h1>
        <p className='error-note'>{translate('error.note')}</p>
        <p className='error-detail'>
          <code>{failure}</code>
        </p>
        <TextLink href={paths.home}>{translate('error.reload')}</TextLink>
      </Main>
    </AppShell>
  )
}
