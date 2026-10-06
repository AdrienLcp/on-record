import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { Highlights } from '@on-record/protocol/assembly/highlights'

import { PrinciplesList } from '@/features/principles/principles-list'
import { ScrutinLine } from '@/features/scrutins/scrutin-line'
import { latestMajorScrutins } from '@/features/scrutins/scrutin-search'
import { VoteMatchPath } from '@/features/vote-match/vote-match-path'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { paths, scrutinsPathFor } from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { FindMyDeputyCard } from './find-my-deputy-card'
import { useVoteMatchData } from './vote-match-loader'

import './vote-match-page.sass'

const LATEST_COUNT = 5

const LatestMajorVotes: React.FC<{
  highlights: Promise<Result<Highlights, DatasetError>>
}> = ({ highlights }) => {
  const result = use(highlights)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  return (
    <ol className='ruled-list'>
      {latestMajorScrutins({
        count: LATEST_COUNT,
        scrutins: [...result.data.solemnVotes, ...result.data.censureMotions]
      }).map((scrutin) => (
        <li key={scrutin.number}>
          <ScrutinLine scrutin={scrutin} />
        </li>
      ))}
    </ol>
  )
}

export const VoteMatchPage: React.FC = () => {
  const translate = useTranslate()
  const { comparison, highlights } = useVoteMatchData()

  return (
    <Main className='vote-match-page'>
      <DocumentTitle>
        {documentTitleFor(translate('voteMatchPage.title'))}
      </DocumentTitle>
      <VoteMatchPath comparison={comparison} />
      <div className='vote-match-columns'>
        <FindMyDeputyCard />
        <RecordCard
          className='latest-votes'
          heading={translate('voteMatchPage.latest.title')}
        >
          <p className='record-note'>
            {translate('voteMatchPage.latest.lead')}
          </p>
          <Suspense fallback={<LoadingLines lines={5} />}>
            <LatestMajorVotes highlights={highlights} />
          </Suspense>
          <p className='record-note'>{translate('common.nominalOnly')}</p>
          <TextLink href={scrutinsPathFor({})}>
            {translate('voteMatchPage.allScrutins')}
          </TextLink>
        </RecordCard>
        <RecordCard
          className='how-to-read'
          heading={translate('voteMatchPage.principlesTitle')}
        >
          <PrinciplesList />
          <TextLink href={paths.method}>
            {translate('voteMatchPage.method')}
          </TextLink>
        </RecordCard>
      </div>
    </Main>
  )
}
