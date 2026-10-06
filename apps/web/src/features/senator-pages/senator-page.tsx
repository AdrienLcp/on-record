import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import {
  senateGroupsById,
  senatorFullNameOf
} from '@/features/senators/senator'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { SenateGroupHistory, SenatorIntro } from './senator-identity'
import { type SenatorIdentity, useSenatorData } from './senator-loader'
import { SenatorVoteList } from './senator-vote-list'
import type { SenatorVoteLine } from './senator-votes'

import './senator-page.sass'

const SenatorRecord: React.FC<{
  identity: SenatorIdentity
  votes: Promise<Result<SenatorVoteLine[], DatasetError>>
}> = ({ identity, votes }) => {
  const lines = use(votes)

  if (lines.status === 'failure') {
    return <DatasetFailure error={lines.error} />
  }

  return (
    <SenatorVoteList
      groupById={senateGroupsById(identity.groups)}
      lines={lines.data}
    />
  )
}

const SenatorDossier: React.FC = () => {
  const translate = useTranslate()
  const { identity, votes } = useSenatorData()
  const result = use(identity)

  if (result.status === 'failure') {
    return (
      <>
        <DocumentTitle>
          {documentTitleFor(translate('senators.title'))}
        </DocumentTitle>
        <DatasetFailure
          error={result.error}
          missingMessage={translate('senator.missing')}
        />
      </>
    )
  }

  return (
    <>
      <DocumentTitle>
        {documentTitleFor(senatorFullNameOf(result.data.senator))}
      </DocumentTitle>
      <SenatorIntro identity={result.data} />
      <div className='senator-columns'>
        <div className='senator-main'>
          <Suspense fallback={<LoadingLines lines={6} />}>
            <SenatorRecord identity={result.data} votes={votes} />
          </Suspense>
        </div>
        <aside className='senator-aside'>
          <SenateGroupHistory identity={result.data} />
        </aside>
      </div>
    </>
  )
}

export const SenatorPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='senator-page'>
      <Suspense
        fallback={
          <>
            <DocumentTitle>
              {documentTitleFor(translate('senators.title'))}
            </DocumentTitle>
            <LoadingLines lines={6} />
          </>
        }
      >
        <SenatorDossier />
      </Suspense>
    </Main>
  )
}
