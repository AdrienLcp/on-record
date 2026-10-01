import type React from 'react'

import {
  fullNameOf,
  latestGroupIdOf,
  leftOfficeOn
} from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { groupsById } from '@/features/groups/group-members'
import { officialDeputyUrl } from '@/features/sources/official-urls'
import { dateOfDay } from '@/helpers/iso-day'
import { groupPathFor, paths } from '@/infrastructure/router/navigation'
import { BackLink } from '@/presentation/components/back-link'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { DeputyIdentity } from './deputy-loader'

import './deputy-identity.sass'

/** Who the deputy is: seat, group today, and the official pages about them. */
export const DeputyIntro: React.FC<{ identity: DeputyIdentity }> = ({
  identity
}) => {
  const translate = useTranslate()
  const { deputy } = identity
  const groupId = latestGroupIdOf(deputy)
  const group =
    groupId === null ? null : (groupsById(identity.groups).get(groupId) ?? null)
  const leftOn = leftOfficeOn(deputy)

  return (
    <PageIntro
      before={
        <BackLink href={paths.deputies}>
          {translate('deputy.allDeputies')}
        </BackLink>
      }
      title={fullNameOf(deputy)}
    >
      <div className='deputy-facts'>
        <GroupLabel group={group} length='full' />
        <span>
          {translate('deputy.constituency', {
            department: deputy.department.name,
            number: deputy.constituency
          })}
        </span>
        {leftOn !== null && (
          <span>
            {translate('deputy.leftOffice', { to: dateOfDay(leftOn) })}
          </span>
        )}
      </div>
      <ul className='deputy-sources'>
        <li>
          <TextLink href={officialDeputyUrl(deputy.id)} target='_blank'>
            {translate('deputy.officialPage')}
          </TextLink>
        </li>
        {deputy.hatvpUrl !== null && (
          <li>
            <TextLink href={deputy.hatvpUrl} target='_blank'>
              {translate('deputy.hatvp')}
            </TextLink>
          </li>
        )}
      </ul>
    </PageIntro>
  )
}

/** Every group the deputy sat in, oldest first, with its dates. */
export const GroupHistory: React.FC<{ identity: DeputyIdentity }> = ({
  identity
}) => {
  const translate = useTranslate()
  const groupById = groupsById(identity.groups)

  return (
    <RecordCard
      className='group-history'
      heading={translate('deputy.groupHistory.title')}
      headingLevel={2}
    >
      <ol className='ruled-list'>
        {identity.deputy.groups.map((membership) => (
          <li
            className='membership'
            key={`${membership.groupId}-${membership.from}`}
          >
            <TextLink href={groupPathFor(membership.groupId)}>
              <GroupLabel
                group={groupById.get(membership.groupId) ?? null}
                length='full'
              />
            </TextLink>
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
