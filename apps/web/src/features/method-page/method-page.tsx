import type React from 'react'
import { Suspense, use } from 'react'

import { PrinciplesList } from '@/features/principles/principles-list'
import { OPEN_LICENCE_URL } from '@/features/sources/official-urls'
import {
  isCataloguedSource,
  licenceOf
} from '@/features/sources/source-catalogue'
import { dateOfTimestamp } from '@/infrastructure/dates'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import { useMethodData } from './method-loader'

import './method-page.sass'

/** The official files the datasets were built from, with their own dates. */
const SourceFiles: React.FC = () => {
  const translate = useTranslate()
  const { meta } = useMethodData()
  const result = use(meta)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  return (
    <>
      <p>
        {translate('method.generatedAt', {
          day: dateOfTimestamp(result.data.generatedAt)
        })}
      </p>
      <ul className='ruled-list source-files'>
        {result.data.sources.map((source) => {
          const catalogued = isCataloguedSource(source.id) ? source.id : null
          const licence = catalogued === null ? null : licenceOf(catalogued)

          return (
            <li className='source-file' key={source.id}>
              {catalogued !== null && (
                <span className='source-name'>
                  {translate(`method.source.names.${catalogued}`)}
                </span>
              )}
              <TextLink
                className='source-url'
                href={source.url}
                target='_blank'
              >
                {source.url.split('/').at(-1) ?? source.url}
              </TextLink>
              <span className='source-date'>
                {source.lastModified === null
                  ? translate('method.source.unknownModified')
                  : translate('method.source.lastModified', {
                      day: dateOfTimestamp(source.lastModified)
                    })}
                {licence !== null && (
                  <>
                    <span aria-hidden='true'> · </span>
                    <TextLink href={licence.url} target='_blank'>
                      {translate(`method.source.licences.${licence.name}`)}
                    </TextLink>
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export const MethodPage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('method.title'))

  return (
    <Main className='method-page'>
      <PageIntro
        lead={translate('method.dataLead')}
        title={translate('method.title')}
      />
      <RecordCard heading={translate('method.sourcesTitle')}>
        <Suspense fallback={<LoadingLines lines={3} />}>
          <SourceFiles />
        </Suspense>
        <p className='record-note'>{translate('common.nominalOnly')}</p>
      </RecordCard>
      <RecordCard heading={translate('method.groupPositionTitle')}>
        <p className='method-prose'>{translate('method.groupPosition')}</p>
      </RecordCard>
      <RecordCard heading={translate('method.summariesTitle')}>
        <p className='method-prose'>{translate('method.summaries')}</p>
      </RecordCard>
      <RecordCard heading={translate('method.principlesTitle')}>
        <PrinciplesList />
      </RecordCard>
      <RecordCard heading={translate('method.licenceTitle')}>
        <p className='method-prose'>
          <RichText
            parts={translate.rich('method.licence', {
              licence: (children) => (
                <TextLink href={OPEN_LICENCE_URL} key='licence' target='_blank'>
                  {children}
                </TextLink>
              )
            })}
          />
        </p>
      </RecordCard>
    </Main>
  )
}
