import type React from 'react'

import { paths, useCurrentPath } from '@/infrastructure/router/navigation'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { TextLink } from '@/presentation/components/ui/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { NoIndex } from '@/presentation/head/no-index'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './not-found-page.sass'

export const NotFoundPage: React.FC = () => {
  const translate = useTranslate()
  const path = useCurrentPath()

  return (
    <Main className='not-found-page'>
      <DocumentTitle>
        {documentTitleFor(translate('notFound.title'))}
      </DocumentTitle>
      <NoIndex />
      <PageIntro
        lead={translate('notFound.message', { path })}
        title={translate('notFound.title')}
      />
      <TextLink href={paths.home}>{translate('notFound.backHome')}</TextLink>
    </Main>
  )
}
