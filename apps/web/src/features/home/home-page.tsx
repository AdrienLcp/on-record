import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { PrinciplesList } from '@/features/principles/principles-list'
import { ScrutinLine } from '@/features/scrutins/scrutin-line'
import { latestMajorScrutins } from '@/features/scrutins/scrutin-search'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { paths, scrutinsPathFor } from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { DeputySearchForm } from './deputy-search-form'
import { useHomeData } from './home-loader'

import './home-page.sass'

const LATEST_COUNT = 5

const LatestMajorVotes: React.FC<{
  scrutins: Promise<Result<ScrutinSummary[], DatasetError>>
}> = ({ scrutins }) => {
  const result = use(scrutins)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  return (
    <ol className='ruled-list'>
      {latestMajorScrutins({ count: LATEST_COUNT, scrutins: result.data }).map(
        (scrutin) => (
          <li key={scrutin.number}>
            <ScrutinLine scrutin={scrutin} />
          </li>
        )
      )}
    </ol>
  )
}

export const HomePage: React.FC = () => {
  const translate = useTranslate()
  const { scrutins } = useHomeData()

  useDocumentTitle(translate('home.title'))

  return (
    <Main className='home-page'>
      <PageIntro lead={translate('home.lead')} title={translate('home.title')}>
        <DeputySearchForm />
      </PageIntro>
      <div className='home-columns'>
        <RecordCard
          className='latest-votes'
          heading={translate('home.latest.title')}
        >
          <p className='record-note'>{translate('home.latest.lead')}</p>
          <Suspense fallback={<LoadingLines lines={5} />}>
            <LatestMajorVotes scrutins={scrutins} />
          </Suspense>
          <p className='record-note'>{translate('common.nominalOnly')}</p>
          <TextLink href={scrutinsPathFor({})}>
            {translate('home.allScrutins')}
          </TextLink>
        </RecordCard>
        <RecordCard
          className='how-to-read'
          heading={translate('home.principlesTitle')}
        >
          <PrinciplesList />
          <TextLink href={paths.method}>{translate('home.method')}</TextLink>
        </RecordCard>
      </div>
    </Main>
  )
}
