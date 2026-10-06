import type React from 'react'

import type { SenateScrutinDetail } from '@on-record/protocol/senate/senate-scrutin'

import { GroupLabel } from '@/features/groups/group-label'
import {
  dissentersOf,
  groupAnchorOf,
  groupsBySize,
  withoutVoteCountOf
} from '@/features/scrutins/group-vote-breakdown'
import { GroupVoteEntry } from '@/features/scrutins/group-vote-entry'
import { senatorFullNameOf } from '@/features/senators/senator'
import { senatorPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { SenateScrutinContext } from './senate-scrutin-loader'

type SenateGroupBreakdownProps = {
  context: SenateScrutinContext
  scrutin: SenateScrutinDetail
}

/** Each Senate group as it stood on the day, largest first, with those who voted otherwise. */
export const SenateGroupBreakdown: React.FC<SenateGroupBreakdownProps> = ({
  context,
  scrutin
}) => {
  const translate = useTranslate()

  return (
    <RecordCard
      className='group-breakdown'
      heading={translate('scrutin.groups.title')}
    >
      <p className='record-note'>{translate('senateScrutin.groups.lead')}</p>
      <ol className='ruled-list'>
        {groupsBySize(scrutin.groups).map((groupVote) => (
          <GroupVoteEntry
            anchorId={groupAnchorOf(groupVote.groupId)}
            dissenters={dissentersOf(groupVote).map((ballot) => {
              const senator = context.senatorsById.get(ballot.senatorId)

              return {
                href: senatorPathFor(ballot.senatorId),
                id: ballot.senatorId,
                name:
                  senator === undefined
                    ? ballot.senatorId
                    : senatorFullNameOf(senator),
                position: ballot.position
              }
            })}
            isCensure={false}
            key={groupVote.groupId}
            label={
              <GroupLabel
                group={context.groupById.get(groupVote.groupId) ?? null}
                length='full'
              />
            }
            majorityPosition={groupVote.majorityPosition}
            memberCount={groupVote.memberCount}
            totals={groupVote.totals}
            withoutVoteCount={withoutVoteCountOf(groupVote)}
          />
        ))}
      </ol>
    </RecordCard>
  )
}
