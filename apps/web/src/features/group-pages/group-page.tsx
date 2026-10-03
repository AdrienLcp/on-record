import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import { GroupLabel } from '@/features/groups/group-label'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfDay } from '@/infrastructure/dates'
import { deputiesPathFor, paths } from '@/infrastructure/router/navigation'
import { BackLink } from '@/presentation/components/back-link'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { TextLink } from '@/presentation/components/ui/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { type GroupIdentity, useGroupData } from './group-loader'
import { GroupPositions } from './group-positions'
import { GroupVoteList } from './group-vote-list'
import type { GroupVoteLine } from './group-votes'

import './group-page.sass'

const GroupIntro: React.FC<{ identity: GroupIdentity }> = ({ identity }) => {
  const translate = useTranslate()
  const { group, memberCount } = identity

  return (
    <PageIntro
      before={
        <BackLink href={paths.groups}>{translate('group.allGroups')}</BackLink>
      }
      lead={translate('group.lead')}
      title={group.name}
    >
      <div className='group-facts'>
        <GroupLabel group={group} />
        <span>
          {group.to === null
            ? translate('deputy.groupHistory.from', {
                from: dateOfDay(group.from)
              })
            : translate('deputy.groupHistory.period', {
                from: dateOfDay(group.from),
                to: dateOfDay(group.to)
              })}
        </span>
        {memberCount !== null && (
          <TextLink href={deputiesPathFor({ group: group.id })}>
            {translate('groups.members', { count: memberCount })}
          </TextLink>
        )}
      </div>
    </PageIntro>
  )
}

const GroupRecord: React.FC<{
  groupId: OrganId
  votes: Promise<Result<GroupVoteLine[], DatasetError>>
}> = ({ groupId, votes }) => {
  const lines = use(votes)

  if (lines.status === 'failure') {
    return <DatasetFailure error={lines.error} />
  }

  return (
    <>
      <GroupPositions groupId={groupId} lines={lines.data} />
      <GroupVoteList lines={lines.data} />
    </>
  )
}

const GroupDossier: React.FC = () => {
  const translate = useTranslate()
  const { identity, votes } = useGroupData()
  const result = use(identity)

  if (result.status === 'failure') {
    return (
      <>
        <DocumentTitle>
          {documentTitleFor(translate('groups.title'))}
        </DocumentTitle>
        <DatasetFailure
          error={result.error}
          missingMessage={translate('group.missing')}
        />
      </>
    )
  }

  return (
    <>
      <DocumentTitle>{documentTitleFor(result.data.group.name)}</DocumentTitle>
      <GroupIntro identity={result.data} />
      <Suspense fallback={<LoadingLines lines={6} />}>
        <GroupRecord groupId={result.data.group.id} votes={votes} />
      </Suspense>
    </>
  )
}

export const GroupPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='group-page'>
      <Suspense
        fallback={
          <>
            <DocumentTitle>
              {documentTitleFor(translate('groups.title'))}
            </DocumentTitle>
            <LoadingLines lines={6} />
          </>
        }
      >
        <GroupDossier />
      </Suspense>
    </Main>
  )
}
