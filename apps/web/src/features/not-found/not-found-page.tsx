import type React from 'react'

import { paths, useCurrentPath } from '@/infrastructure/router/navigation'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './not-found-page.sass'

export const NotFoundPage: React.FC = () => {
  const translate = useTranslate()
  const path = useCurrentPath()

  useDocumentTitle(translate('notFound.title'))

  return (
    <Main className='not-found-page'>
      <PageIntro
        lead={translate('notFound.message', { path })}
        title={translate('notFound.title')}
      />
      <TextLink href={paths.home}>{translate('notFound.backHome')}</TextLink>
    </Main>
  )
}
