import type React from 'react'

import { GroupLabel } from '@/features/groups/group-label'
import {
  latestSenateGroupIdOf,
  senateGroupsById,
  senatorFullNameOf,
  senatorLeftOfficeOn
} from '@/features/senators/senator'
import { officialSenatorUrl } from '@/features/sources/official-urls'
import { dateOfDay } from '@/infrastructure/dates'
import { paths } from '@/infrastructure/router/navigation'
import { BackLink } from '@/presentation/components/back-link'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { SenatorIdentity } from './senator-loader'

import './senator-identity.sass'

/** Who the senator is: seat, group today, and the official pages about them. */
export const SenatorIntro: React.FC<{ identity: SenatorIdentity }> = ({
  identity
}) => {
  const translate = useTranslate()
  const { senator } = identity
  const groupId = latestSenateGroupIdOf(senator)
  const group =
    groupId === null
      ? null
      : (senateGroupsById(identity.groups).get(groupId) ?? null)
  const leftOn = senatorLeftOfficeOn(senator)

  return (
    <PageIntro
      before={
        <BackLink href={paths.senators}>
          {translate('senator.allSenators')}
        </BackLink>
      }
      title={senatorFullNameOf(senator)}
    >
      <div className='senator-facts'>
        <GroupLabel group={group} length='full' />
        <span>
          {translate('senator.constituency', {
            gender: senator.gender,
            name: senator.constituency.name
          })}
        </span>
        {leftOn !== null && (
          <span>
            {translate('deputy.leftOffice', { to: dateOfDay(leftOn) })}
          </span>
        )}
      </div>
      <ul className='senator-sources'>
        <li>
          <TextLink href={officialSenatorUrl(senator)} target='_blank'>
            {translate('senator.officialPage')}
          </TextLink>
        </li>
        {senator.hatvpUrl !== null && (
          <li>
            <TextLink href={senator.hatvpUrl} target='_blank'>
              {translate('deputy.hatvp')}
            </TextLink>
          </li>
        )}
      </ul>
    </PageIntro>
  )
}

/** Every group the senator sat in since October 2023, oldest first, with its dates. */
export const SenateGroupHistory: React.FC<{ identity: SenatorIdentity }> = ({
  identity
}) => {
  const translate = useTranslate()
  const groupById = senateGroupsById(identity.groups)

  return (
    <RecordCard
      className='senate-group-history'
      heading={translate('senator.groupHistory.title')}
      headingLevel={2}
    >
      <ol className='ruled-list'>
        {identity.senator.groups.map((membership) => (
          <li
            className='membership'
            key={`${membership.groupId}-${membership.from}`}
          >
            <GroupLabel
              group={groupById.get(membership.groupId) ?? null}
              length='full'
            />
            <span className='membership-period'>
              {membership.to === null
                ? translate('deputy.groupHistory.from', {
                    from: dateOfDay(membership.from)
                  })
                : translate('deputy.groupHistory.period', {
                    from: dateOfDay(membership.from),
                    to: dateOfDay(membership.to)
                  })}
            </span>
          </li>
        ))}
      </ol>
    </RecordCard>
  )
}
