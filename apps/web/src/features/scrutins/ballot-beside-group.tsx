import type React from 'react'

import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { BallotMark } from './ballot-mark'

import './ballot-beside-group.sass'

type BallotBesideGroupProps = {
  byDelegation: boolean
  /** The "mise au point" declared afterwards, if any. */
  correction: BallotPosition | null
  /** The member's group of that day, as a label. */
  group: React.ReactNode
  /** `null` when the group had no majority. */
  groupPosition: BallotPosition | null
  position: BallotPosition
}

/** One member's recorded vote, their correction, and their group's majority of that day. */
export const BallotBesideGroup: React.FC<BallotBesideGroupProps> = ({
  byDelegation,
  correction,
  group,
  groupPosition,
  position
}) => {
  const translate = useTranslate()

  return (
    <dl className='ballot-beside-group'>
      <div className='ballot-row'>
        <dt>{translate('ballot.ownVote')}</dt>
        <dd>
          <BallotMark position={position} />
          {byDelegation && (
            <span className='ballot-aside'>
              {translate('ballot.byDelegation')}
            </span>
          )}
        </dd>
      </div>
      {correction !== null && (
        <div className='ballot-row correction'>
          <dt className='correction-flag'>
            {translate('ballot.correction', { intended: correction })}
          </dt>
          <dd>
            <BallotMark position={correction} withLabel={false} />
          </dd>
        </div>
      )}
      <div className='ballot-row'>
        <dt>
          {translate('ballot.groupMajority')} {group}
        </dt>
        <dd>
          {groupPosition === null ? (
            <span className='ballot-aside'>
              {translate('ballot.groupNoMajority')}
            </span>
          ) : (
            <BallotMark position={groupPosition} />
          )}
        </dd>
      </div>
    </dl>
  )
}
