import type React from 'react'

import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import { BallotMark } from '@/features/scrutins/ballot-mark'
import { VoteBar } from '@/features/scrutins/vote-bar'
import { groupPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  censureSupportOf,
  GROUP_POSITIONS,
  type GroupVoteLine,
  solemnPositionCountsOf
} from './group-votes'

import './group-positions.sass'

/** Always listed, even at zero: a group that never abstained says something too. */
const CAST_POSITIONS = new Set(['for', 'abstention', 'against'])

type GroupPositionsProps = {
  groupId: OrganId
  lines: readonly GroupVoteLine[]
}

const SolemnPositions: React.FC<GroupPositionsProps> = ({ groupId, lines }) => {
  const translate = useTranslate()
  const { byPosition, total } = solemnPositionCountsOf(lines)

  return (
    <section className='position-figure'>
      <h3 className='position-figure-title'>
        {translate('group.positions.solemn.title')}
      </h3>
      {total === 0 ? (
        <p className='record-note'>
          {translate('group.positions.solemn.none')}
        </p>
      ) : (
        <>
          <p className='position-figure-lead'>
            {translate('group.positions.solemn.lead', { count: total })}
          </p>
          <VoteBar
            base={total}
            totals={{
              abstention: byPosition.abstention,
              against: byPosition.against,
              for: byPosition.for,
              nonVoting: 0
            }}
          />
          <ul className='position-counts'>
            {GROUP_POSITIONS.filter(
              (position) =>
                CAST_POSITIONS.has(position) || byPosition[position] > 0
            ).map((position) => (
              <li className='position-count' key={position}>
                {position === 'none' ? (
                  <span className='position-none'>
                    {translate('group.positions.noPosition')}
                  </span>
                ) : (
                  <BallotMark position={position} />
                )}
                <TextLink href={groupPathFor(groupId, { ballot: position })}>
                  {translate('group.positions.votes', {
                    count: byPosition[position]
                  })}
                </TextLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

const CensureSupport: React.FC<GroupPositionsProps> = ({ groupId, lines }) => {
  const translate = useTranslate()
  const { backedByMostMembers, motions } = censureSupportOf(lines)

  return (
    <section className='position-figure'>
      <h3 className='position-figure-title'>
        {translate('group.positions.censure.title')}
      </h3>
      {motions === 0 ? (
        <p className='record-note'>
          {translate('group.positions.censure.none')}
        </p>
      ) : (
        <>
          <p className='position-figure-value'>
            {translate('common.countOf', {
              shown: backedByMostMembers,
              total: motions
            })}
          </p>
          <p className='position-figure-lead'>
            {translate('group.positions.censure.lead')}{' '}
            <TextLink href={groupPathFor(groupId, { kind: 'censure' })}>
              {translate('group.positions.censure.list', { count: motions })}
            </TextLink>
          </p>
          <p className='record-note'>
            {translate('group.positions.censure.context')}
          </p>
        </>
      )}
    </section>
  )
}

/**
 * Where the group stood on the votes people recognise, each count one click
 * from the scrutins it counts.
 */
export const GroupPositions: React.FC<GroupPositionsProps> = ({
  groupId,
  lines
}) => {
  const translate = useTranslate()

  return (
    <RecordCard
      className='group-positions'
      heading={translate('group.positions.title')}
    >
      <div className='position-figures'>
        <SolemnPositions groupId={groupId} lines={lines} />
        <CensureSupport groupId={groupId} lines={lines} />
      </div>
      <p className='record-note'>{translate('group.positions.context')}</p>
      <p className='record-note'>{translate('common.nominalOnly')}</p>
    </RecordCard>
  )
}
