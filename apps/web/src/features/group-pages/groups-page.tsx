import type React from 'react'
import { Suspense, use } from 'react'

import type { Group } from '@on-record/protocol/assembly/group'

import type { Directory } from '@/features/deputies/directory-api'
import { GroupLabel } from '@/features/groups/group-label'
import {
  activeGroupsBySize,
  sittingMemberCounts
} from '@/features/groups/group-members'
import { dateOfDay } from '@/helpers/iso-day'
import {
  deputiesPathFor,
  groupPathFor
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useGroupsData } from './groups-loader'

import './groups-page.sass'

/** `memberCount` is `null` for a dissolved group, whose members now sit elsewhere. */
const GroupEntry: React.FC<{ group: Group; memberCount: number | null }> = ({
  group,
  memberCount
}) => {
  const translate = useTranslate()

  return (
    <div className='group-entry'>
      <span className='group-entry-name'>
        <TextLink href={groupPathFor(group.id)}>
          <GroupLabel group={group} length='full' />
        </TextLink>
        <span className='group-entry-acronym'>{group.shortName}</span>
      </span>
      {memberCount !== null && (
        <TextLink
          className='group-entry-members'
          href={deputiesPathFor({ group: group.id })}
        >
          {translate('groups.members', { count: memberCount })}
        </TextLink>
      )}
      {group.to !== null && (
        <span className='group-entry-dissolved'>
          {translate('groups.dissolved', { to: dateOfDay(group.to) })}
        </span>
      )}
    </div>
  )
}

const GroupRegister: React.FC<{ directory: Directory }> = ({ directory }) => {
  const translate = useTranslate()
  const counts = sittingMemberCounts(directory.deputies)
  const dissolved = directory.groups.filter((group) => group.to !== null)

  return (
    <>
      <RecordCard heading={translate('groups.sitting')}>
        <ol className='ruled-list'>
          {activeGroupsBySize({ counts, groups: directory.groups }).map(
            (group) => (
              <li key={group.id}>
                <GroupEntry
                  group={group}
                  memberCount={counts.get(group.id) ?? 0}
                />
              </li>
            )
          )}
        </ol>
        <p className='record-note'>{translate('groups.colorNote')}</p>
      </RecordCard>
      {dissolved.length > 0 && (
        <RecordCard heading={translate('groups.formerTitle')}>
          <ol className='ruled-list'>
            {dissolved.map((group) => (
              <li key={group.id}>
                <GroupEntry group={group} memberCount={null} />
              </li>
            ))}
          </ol>
        </RecordCard>
      )}
    </>
  )
}

const RegisterOrFailure: React.FC = () => {
  const { directory } = useGroupsData()
  const result = use(directory)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <GroupRegister directory={result.data} />
  )
}

export const GroupsPage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('groups.title'))

  return (
    <Main className='groups-page'>
      <PageIntro
        lead={translate('groups.lead')}
        title={translate('groups.title')}
      />
      <Suspense fallback={<LoadingLines lines={8} />}>
        <RegisterOrFailure />
      </Suspense>
    </Main>
  )
}
