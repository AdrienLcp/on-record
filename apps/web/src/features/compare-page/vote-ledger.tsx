import type React from 'react'

import type { Group } from '@on-record/protocol/assembly/group'
import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { withoutVoteCountOf } from '@/features/group-pages/group-votes'
import { PartySwatch } from '@/features/parties/party-swatch'
import type { RaceParty } from '@/features/parties/presidential-race'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { VoteBar } from '@/features/scrutins/vote-bar'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import { dateOfDay } from '@/helpers/iso-day'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  type ComparedKind,
  type PartyStance,
  type PartyStanceOnVote,
  partyStanceOn
} from './party-comparison'
import { StanceMark } from './stance-mark'

import './vote-ledger.sass'

/** A compared party and the group it votes through, when the data has it. */
export type LedgerColumn = {
  group: Group | undefined
  party: RaceParty
}

const LEGEND_STANCES = {
  censure: ['backed', 'someVoices', 'notBacked'],
  solemn: ['for', 'abstention', 'against', 'nonVoting', 'none']
} as const satisfies Record<ComparedKind, readonly PartyStance[]>

const ColumnLabel: React.FC<{ column: LedgerColumn }> = ({ column }) => {
  const translate = useTranslate()

  return (
    <span className='ledger-party-label'>
      <PartySwatch background={column.group?.color} />
      <span className='ledger-party-name'>
        {translate(`party.names.${column.party.id}`)}
      </span>
      {!column.party.groupBearsItsName && column.group !== undefined && (
        <span className='ledger-party-group'>{column.group.shortName}</span>
      )}
    </span>
  )
}

const StanceCounts: React.FC<{ kind: ComparedKind; on: PartyStanceOnVote }> = ({
  kind,
  on
}) => {
  const translate = useTranslate()
  const { record } = on

  if (record === null) {
    return (
      <p className='ledger-counts'>{translate('compare.notListedCounts')}</p>
    )
  }

  return (
    <>
      <VoteBar base={record.memberCount} totals={record.totals} />
      <p className='ledger-counts'>
        {kind === 'censure'
          ? translate('group.votes.censureCount', {
              count: record.totals.for,
              members: record.memberCount
            })
          : `${translate('scrutin.totals.vote', record.totals)} · ${translate(
              'scrutin.groups.withoutVote',
              {
                count: withoutVoteCountOf(record)
              }
            )}`}
      </p>
    </>
  )
}

const LedgerRow: React.FC<{
  columns: readonly LedgerColumn[]
  kind: ComparedKind
  vote: MajorVote
}> = ({ columns, kind, vote }) => {
  const translate = useTranslate()
  const stances = columns.map((column) => ({
    column,
    on: partyStanceOn({ groupId: column.party.groupId, vote })
  }))

  return (
    <details className='ledger-row'>
      <summary>
        <span className='ledger-vote'>
          <span className='ledger-vote-meta'>
            <span className='ledger-reference'>
              {translate('scrutin.reference', { number: vote.number })}
            </span>
            <time dateTime={vote.date}>
              {translate('common.shortDay', { day: dateOfDay(vote.date) })}
            </time>
            <OutcomeStamp outcome={vote.outcome} />
          </span>
          <span className='ledger-vote-title'>
            <span aria-hidden='true' className='ledger-chevron' />
            <span>{vote.title}</span>
          </span>
        </span>
        {stances.map(({ column, on }) => (
          <span className='ledger-cell' key={column.party.id}>
            <VisuallyHidden elementType='span'>
              {translate(`party.names.${column.party.id}`)} :
            </VisuallyHidden>
            <StanceMark stance={on.stance} />
          </span>
        ))}
      </summary>
      <div className='ledger-detail'>
        <p className='ledger-object'>
          {translate(`scrutin.object.${voteObjectOf(vote)}.what`)}
        </p>
        <ul className='ledger-detail-lines'>
          {stances.map(({ column, on }) => (
            <li className='ledger-detail-line' key={column.party.id}>
              <ColumnLabel column={column} />
              <StanceMark stance={on.stance} />
              <StanceCounts kind={kind} on={on} />
            </li>
          ))}
        </ul>
        <TextLink href={scrutinPathFor(vote.number)}>
          {translate('compare.scrutinLink', { number: vote.number })}
        </TextLink>
      </div>
    </details>
  )
}

type VoteLedgerProps = {
  columns: readonly LedgerColumn[]
  kind: ComparedKind
  votes: readonly MajorVote[]
}

/**
 * One line per vote, one column per party: each column's mark is the
 * stance of that party's group. A line opens on the votes behind each mark.
 */
export const VoteLedger: React.FC<VoteLedgerProps> = ({
  columns,
  kind,
  votes
}) => {
  const translate = useTranslate()

  return (
    <div className='vote-ledger' style={{ '--columns': columns.length }}>
      <ul aria-label={translate('compare.legend')} className='ledger-legend'>
        {LEGEND_STANCES[kind].map((stance) => (
          <li key={stance}>
            <StanceMark stance={stance} />
          </li>
        ))}
      </ul>
      <div aria-hidden='true' className='ledger-columns'>
        <span className='ledger-column-vote'>
          {translate('compare.columnVote')}
        </span>
        {columns.map((column) => (
          <span className='ledger-column-party' key={column.party.id}>
            <ColumnLabel column={column} />
            <span className='ledger-party-acronym'>
              {column.group?.shortName}
            </span>
          </span>
        ))}
      </div>
      <ol className='ledger-rows'>
        {votes.map((vote) => (
          <li key={vote.number}>
            <LedgerRow columns={columns} kind={kind} vote={vote} />
          </li>
        ))}
      </ol>
    </div>
  )
}
