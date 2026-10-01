import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import { fullNameOf } from '@/features/deputies/deputy'
import { groupsById } from '@/features/groups/group-members'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { DeputyFigures } from './deputy-figures'
import { DeputyIntro, GroupHistory } from './deputy-identity'
import { type DeputyIdentity, useDeputyData } from './deputy-loader'
import { DeputyVoteList } from './deputy-vote-list'
import type { DeputyVoteLine } from './deputy-votes'

import './deputy-page.sass'

type VoteLinesResult = Promise<Result<DeputyVoteLine[], DatasetError>>

const DeputyRecord: React.FC<{
  identity: DeputyIdentity
  votes: VoteLinesResult
}> = ({ identity, votes }) => {
  const lines = use(votes)

  if (lines.status === 'failure') {
    return <DatasetFailure error={lines.error} />
  }

  return (
    <>
      <DeputyFigures deputyId={identity.deputy.id} lines={lines.data} />
      <DeputyVoteList
        groupById={groupsById(identity.groups)}
        lines={lines.data}
      />
    </>
  )
}

const DeputyDossier: React.FC = () => {
  const translate = useTranslate()
  const { identity, votes } = useDeputyData()
  const result = use(identity)

  useDocumentTitle(
    result.status === 'success'
      ? fullNameOf(result.data.deputy)
      : translate('deputies.title')
  )

  if (result.status === 'failure') {
    return (
      <DatasetFailure
        error={result.error}
        missingMessage={translate('deputy.missing')}
      />
    )
  }

  return (
    <>
      <DeputyIntro identity={result.data} />
      <div className='deputy-columns'>
        <div className='deputy-main'>
          <Suspense fallback={<LoadingLines lines={6} />}>
            <DeputyRecord identity={result.data} votes={votes} />
          </Suspense>
        </div>
        <aside className='deputy-aside'>
          <GroupHistory identity={result.data} />
        </aside>
      </div>
    </>
  )
}

export const DeputyPage: React.FC = () => (
  <Main className='deputy-page'>
    <Suspense fallback={<LoadingLines lines={6} />}>
      <DeputyDossier />
    </Suspense>
  </Main>
)
