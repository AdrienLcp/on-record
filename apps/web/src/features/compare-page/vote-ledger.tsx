import type React from 'react'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { withoutVoteCountOf } from '@/features/group-pages/group-votes'
import { PartySwatch } from '@/features/parties/party-swatch'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { ScrutinTitleDetail } from '@/features/scrutins/scrutin-title-detail'
import { VoteBar } from '@/features/scrutins/vote-bar'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import { summarisedFileOf } from '@/features/text-summaries/summarised-text'
import { TextName } from '@/features/text-summaries/text-name'
import { TextSummary } from '@/features/text-summaries/text-summary'
import { dateOfDay } from '@/infrastructure/dates'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ComparedPartyLabel } from './compared-party-label'
import {
  type ComparedKind,
  type ComparedParty,
  type PartyStance,
  type PartyStanceOnVote,
  partyStanceOn
} from './party-comparison'
import { StanceMark } from './stance-mark'
import { TextReading } from './text-reading'
import type { ComparedText } from './text-readings'

import './vote-ledger.sass'

/** The colour a cell is washed in; a stance with no position of its own stays on the card. */
const CELL_TINTS: Partial<
  Record<PartyStance, 'abstention' | 'against' | 'for'>
> = {
  abstention: 'abstention',
  against: 'against',
  backed: 'for',
  for: 'for',
  someVoices: 'abstention'
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

const LatestReading: React.FC<{
  kind: ComparedKind
  stances: readonly { column: ComparedParty; on: PartyStanceOnVote }[]
  vote: MajorVote
}> = ({ kind, stances, vote }) => {
  const translate = useTranslate()
  const title = scrutinTitleOf(vote.title)

  return (
    <section className='ledger-latest'>
      {kind === 'solemn' && (
        <h4 className='ledger-latest-stage'>
          {translate('compare.ledger.latestReading', {
            day: dateOfDay(vote.date),
            stage:
              title.kind === 'text' && title.stage !== null
                ? translate(`scrutinTitle.stage.${title.stage}`)
                : translate('compare.texts.withoutStage')
          })}
        </h4>
      )}
      <p className='ledger-object'>
        {translate(`scrutin.object.${voteObjectOf(vote)}.what`)}
      </p>
      <ul className='ledger-detail-lines'>
        {stances.map(({ column, on }) => (
          <li className='ledger-detail-line' key={column.party.id}>
            <ComparedPartyLabel compared={column} />
            <StanceMark stance={on.stance} />
            <StanceCounts kind={kind} on={on} />
          </li>
        ))}
      </ul>
      <TextLink href={scrutinPathFor(vote.number)}>
        {translate('compare.scrutinLink', { number: vote.number })}
      </TextLink>
    </section>
  )
}

const LedgerRow: React.FC<{
  columns: readonly ComparedParty[]
  kind: ComparedKind
  text: ComparedText
}> = ({ columns, kind, text }) => {
  const translate = useTranslate()
  const latest = text.readings.at(-1)

  if (latest === undefined) {
    return null
  }

  const earlier = text.readings.slice(0, -1)
  const summarisedFile = summarisedFileOf(text.readings)
  const stances = columns.map((column) => ({
    column,
    on: partyStanceOn({ groupId: column.party.groupId, vote: latest })
  }))

  return (
    <details className='ledger-row'>
      <summary>
        <span className='ledger-vote'>
          <span className='ledger-vote-title'>
            <span aria-hidden='true' className='ledger-chevron' />
            <span className='ledger-vote-subject'>
              <TextName summarisedFile={summarisedFile} title={text.title} />
            </span>
          </span>
          <span className='ledger-vote-meta'>
            <span className='ledger-reference'>
              {translate('scrutin.reference', { number: latest.number })}
            </span>
            <time dateTime={latest.date}>
              {translate('common.shortDay', { day: dateOfDay(latest.date) })}
            </time>
            <OutcomeStamp outcome={latest.outcome} />
            {earlier.length > 0 && (
              <span>
                {translate('compare.texts.readingCount', {
                  count: text.readings.length
                })}
              </span>
            )}
          </span>
          <ScrutinTitleDetail title={text.title} />
        </span>
        {stances.map(({ column, on }) => (
          <span
            className='ledger-cell'
            data-tint={CELL_TINTS[on.stance]}
            key={column.party.id}
          >
            <span className='ledger-cell-party'>
              <PartySwatch background={column.group?.color} />
              {translate(`party.names.${column.party.id}`)}
            </span>
            <StanceMark stance={on.stance} />
          </span>
        ))}
      </summary>
      <div className='ledger-detail'>
        {summarisedFile !== null && (
          <TextSummary summarisedFile={summarisedFile} title={text.title} />
        )}
        <LatestReading kind={kind} stances={stances} vote={latest} />
        {earlier.length > 0 && (
          <section className='ledger-earlier'>
            <h4 className='ledger-earlier-label'>
              {translate('compare.ledger.earlierReadings')}
            </h4>
            <ol className='text-readings'>
              {earlier.toReversed().map((vote) => (
                <TextReading
                  key={vote.number}
                  kind={kind}
                  parties={columns}
                  previous={text.readings[text.readings.indexOf(vote) - 1]}
                  vote={vote}
                />
              ))}
            </ol>
          </section>
        )}
      </div>
    </details>
  )
}

type VoteLedgerProps = {
  columns: readonly ComparedParty[]
  kind: ComparedKind
  texts: readonly ComparedText[]
}

/**
 * One line per text, one column per party: each column's mark is the stance
 * of that party's group at the text's latest solemn vote. A line opens on
 * what the text does, the votes behind each mark, and the earlier readings.
 * On a phone the columns are too narrow to name their party, so each mark
 * becomes a line of its own that does.
 */
export const VoteLedger: React.FC<VoteLedgerProps> = ({
  columns,
  kind,
  texts
}) => {
  const translate = useTranslate()

  return (
    <div className='vote-ledger' style={{ '--columns': columns.length }}>
      <div aria-hidden='true' className='ledger-columns'>
        <span className='ledger-column-vote'>
          {translate('compare.columnVote')}
        </span>
        {columns.map((column) => (
          <span className='ledger-column-party' key={column.party.id}>
            <PartySwatch background={column.group?.color} />
            <span className='ledger-party-name'>
              {translate(`party.names.${column.party.id}`)}
            </span>
            {!column.party.groupBearsItsName && column.group !== undefined && (
              <span className='ledger-party-group'>
                {column.group.shortName}
              </span>
            )}
          </span>
        ))}
      </div>
      <ol className='ledger-rows'>
        {texts.map((text) => (
          <li key={text.readings[0]?.number}>
            <LedgerRow columns={columns} kind={kind} text={text} />
          </li>
        ))}
      </ol>
    </div>
  )
}
