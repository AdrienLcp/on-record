import type React from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf } from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { usePartySelection } from '@/features/parties/use-party-selection'
import {
  dissentersOf,
  groupAnchorOf,
  groupsBySize,
  withoutVoteCountOf
} from '@/features/scrutins/group-vote-breakdown'
import { GroupVoteEntry } from '@/features/scrutins/group-vote-entry'
import { deputyPathFor, groupPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ScrutinContext } from './scrutin-loader'

type GroupBreakdownProps = {
  context: ScrutinContext
  scrutin: ScrutinDetail
}

/**
 * Each group as it stood on the day: its members, its majority, the bar of
 * its votes, and — the interesting part — those who voted otherwise.
 */
export const GroupBreakdown: React.FC<GroupBreakdownProps> = ({
  context,
  scrutin
}) => {
  const translate = useTranslate()
  const { showsGroup } = usePartySelection()
  const shownGroups = scrutin.groups.filter((groupVote) =>
    showsGroup(groupVote.groupId)
  )

  return (
    <RecordCard
      className='group-breakdown'
      heading={translate('scrutin.groups.title')}
    >
      <p className='record-note'>
        {translate(
          scrutin.kind === 'censure'
            ? 'scrutin.groups.censureLead'
            : 'scrutin.groups.lead'
        )}
      </p>
      {shownGroups.length === 0 && (
        <p className='record-note'>{translate('party.noGroupShown')}</p>
      )}
      <ol className='ruled-list'>
        {groupsBySize(shownGroups).map((groupVote) => (
          <GroupVoteEntry
            anchorId={groupAnchorOf(groupVote.groupId)}
            dissenters={dissentersOf(groupVote).map((ballot) => {
              const deputy = context.deputiesById.get(ballot.deputyId)

              return {
                href: deputyPathFor(ballot.deputyId),
                id: ballot.deputyId,
                name:
                  deputy === undefined ? ballot.deputyId : fullNameOf(deputy),
                position: ballot.position
              }
            })}
            isCensure={scrutin.kind === 'censure'}
            key={groupVote.groupId}
            label={
              <TextLink href={groupPathFor(groupVote.groupId)}>
                <GroupLabel
                  group={context.groupById.get(groupVote.groupId) ?? null}
                  length='full'
                />
              </TextLink>
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
