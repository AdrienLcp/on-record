import type React from 'react'

import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'
import type { VoteTotals } from '@on-record/protocol/votes/vote-totals'

import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { BallotMark } from './ballot-mark'
import { VoteBar } from './vote-bar'

import './group-vote-entry.sass'

/** A member who voted otherwise than their group's majority. */
export type Dissenter = {
  href: string
  id: string
  name: string
  position: BallotPosition
}

type GroupVoteEntryProps = {
  /** The id a summary row links to. */
  anchorId: string
  dissenters: readonly Dissenter[]
  /** Only votes for are recorded on a motion of censure. */
  isCensure: boolean
  /** The group's label, linked to its page when it has one. */
  label: React.ReactNode
  /** `null` on a tie or when no member voted. */
  majorityPosition: BallotPosition | null
  memberCount: number
  totals: VoteTotals
  /** Members of the group that day with no recorded vote. */
  withoutVoteCount: number
}

/**
 * One group as it stood on the day of a scrutin: its members, its majority,
 * the bar of its votes, and — the interesting part — those who voted otherwise.
 */
export const GroupVoteEntry: React.FC<GroupVoteEntryProps> = ({
  anchorId,
  dissenters,
  isCensure,
  label,
  majorityPosition,
  memberCount,
  totals,
  withoutVoteCount
}) => {
  const translate = useTranslate()

  return (
    <li className='group-vote' id={anchorId}>
      <div className='group-vote-head'>
        {label}
        <span className='group-vote-members'>
          {translate('scrutin.groups.members', { count: memberCount })}
        </span>
      </div>
      <VoteBar base={memberCount} totals={totals} />
      <p className='group-vote-counts'>
        {isCensure
          ? translate('scrutin.totals.censure', { for: totals.for })
          : `${translate('scrutin.totals.vote', totals)} · ${translate(
              'scrutin.groups.withoutVote',
              { count: withoutVoteCount }
            )}`}
      </p>
      {!isCensure && (
        <p className='group-vote-majority'>
          {majorityPosition === null
            ? translate('scrutin.groups.noMajority')
            : translate('scrutin.groups.majority', {
                position: majorityPosition
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
            {dissenters.map((dissenter) => (
              <li className='dissenter' key={dissenter.id}>
                <TextLink href={dissenter.href}>{dissenter.name}</TextLink>
                <BallotMark position={dissenter.position} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}
