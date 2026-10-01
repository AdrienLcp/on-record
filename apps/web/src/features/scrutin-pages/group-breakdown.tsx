import type React from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf } from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { BallotMark } from '@/features/scrutins/ballot-mark'
import { deputyPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  dissentersOf,
  groupAnchorOf,
  groupsBySize,
  withoutVoteCountOf
} from './scrutin-breakdown'
import type { ScrutinContext } from './scrutin-loader'
import { VoteBar } from './vote-bar'

import './group-breakdown.sass'

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
      <ol className='ruled-list'>
        {groupsBySize(scrutin.groups).map((groupVote) => {
          const dissenters = dissentersOf(groupVote)
          const isCensure = scrutin.kind === 'censure'

          return (
            <li
              className='group-vote'
              id={groupAnchorOf(groupVote.groupId)}
              key={groupVote.groupId}
            >
              <div className='group-vote-head'>
                <GroupLabel
                  group={context.groupById.get(groupVote.groupId) ?? null}
                  length='full'
                />
                <span className='group-vote-members'>
                  {translate('scrutin.groups.members', {
                    count: groupVote.memberCount
                  })}
                </span>
              </div>
              <VoteBar base={groupVote.memberCount} totals={groupVote.totals} />
              <p className='group-vote-counts'>
                {isCensure
                  ? translate('scrutin.totals.censure', {
                      for: groupVote.totals.for
                    })
                  : `${translate('scrutin.totals.vote', groupVote.totals)} · ${translate(
                      'scrutin.groups.withoutVote',
                      { count: withoutVoteCountOf(groupVote) }
                    )}`}
              </p>
              {!isCensure && (
                <p className='group-vote-majority'>
                  {groupVote.majorityPosition === null
                    ? translate('scrutin.groups.noMajority')
                    : translate('scrutin.groups.majority', {
                        position: groupVote.majorityPosition
                      })}
                </p>
              )}
              {dissenters.length > 0 && (
                <div className='dissenters'>
                  <p className='dissenters-title'>
                    {translate('scrutin.groups.dissenters', {
                      count: dissenters.length
                    })}
                  </p>
                  <ul className='dissenters-list'>
                    {dissenters.map((ballot) => {
                      const deputy = context.deputiesById.get(ballot.deputyId)

                      return (
                        <li className='dissenter' key={ballot.deputyId}>
                          <TextLink href={deputyPathFor(ballot.deputyId)}>
                            {deputy === undefined
                              ? ballot.deputyId
                              : fullNameOf(deputy)}
                          </TextLink>
                          <BallotMark position={ballot.position} />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </RecordCard>
  )
}
