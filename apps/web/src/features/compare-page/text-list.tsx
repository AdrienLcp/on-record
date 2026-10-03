import type React from 'react'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { TextKindTag } from '@/features/scrutins/text-kind-tag'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import { dateOfDay } from '@/infrastructure/dates'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ComparedPartyLabel } from './compared-party-label'
import {
  type ComparedKind,
  type ComparedParty,
  partyStanceOn
} from './party-comparison'
import { StanceMark } from './stance-mark'
import { type ComparedText, stanceLeftBehind } from './text-readings'

import './text-list.sass'

const TEXTS_PER_PAGE = 10

const TextHeading: React.FC<{ text: ComparedText }> = ({ text }) => {
  const translate = useTranslate()
  const { title } = text

  return (
    <header className='text-entry-head'>
      <h3 className='text-entry-name'>
        <ScrutinSubject title={title} />
      </h3>
      {title.kind !== 'censure' && (
        <span className='text-entry-count'>
          {translate('compare.texts.readingCount', {
            count: text.readings.length
          })}
        </span>
      )}
      {title.kind === 'text' && (
        <p className='text-entry-detail'>
          <TextKindTag textKind={title.textKind} />
        </p>
      )}
      {title.kind === 'censure' && (
        <p className='text-entry-detail'>
          {translate('scrutinTitle.censure.tabledBy', {
            authors: title.authors
          })}
        </p>
      )}
    </header>
  )
}

const Reading: React.FC<{
  kind: ComparedKind
  parties: readonly ComparedParty[]
  previous: MajorVote | undefined
  vote: MajorVote
}> = ({ kind, parties, previous, vote }) => {
  const translate = useTranslate()
  const title = scrutinTitleOf(vote.title)
  const stage = title.kind === 'text' ? title.stage : null

  return (
    <li className='text-reading'>
      <p className='text-reading-meta'>
        {kind === 'solemn' && (
          <span className='text-reading-stage'>
            {stage === null
              ? translate('compare.texts.withoutStage')
              : translate(`scrutinTitle.stage.${stage}`)}
          </span>
        )}
        {title.kind === 'text' && title.isSecondDeliberation && (
          <span>{translate('scrutinTitle.secondDeliberation')}</span>
        )}
        {voteObjectOf(vote) === 'textPart' && (
          <span>{translate('compare.texts.revenuePartOnly')}</span>
        )}
        <time dateTime={vote.date}>
          {translate('common.shortDay', { day: dateOfDay(vote.date) })}
        </time>
        <OutcomeStamp outcome={vote.outcome} />
        <TextLink
          className='text-reading-link'
          href={scrutinPathFor(vote.number)}
        >
          {translate('scrutin.reference', { number: vote.number })}
        </TextLink>
      </p>
      <ul className='text-stances' style={{ '--columns': parties.length }}>
        {parties.map((compared) => {
          const { groupId } = compared.party
          const stance = partyStanceOn({ groupId, vote }).stance
          const before = stanceLeftBehind({
            current: stance,
            previous:
              previous === undefined
                ? undefined
                : partyStanceOn({ groupId, vote: previous }).stance
          })

          return (
            <li
              className='text-stance'
              data-changed={before !== null || undefined}
              key={compared.party.id}
            >
              <ComparedPartyLabel compared={compared} />
              <StanceMark stance={stance} />
              {before !== null && (
                <span className='text-stance-change'>
                  {translate('compare.texts.changedFrom', { before })}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </li>
  )
}

type TextListProps = {
  kind: ComparedKind
  /** Changes with the filters, so a new search starts again from the top. */
  listKey: string
  parties: readonly ComparedParty[]
  texts: readonly ComparedText[]
}

/**
 * One entry per text, each time the Assemblée voted it in order: every
 * compared party's stance at each reading, and who changed sides since the
 * previous one. A motion of censure is an entry of its own.
 */
export const TextList: React.FC<TextListProps> = ({
  kind,
  listKey,
  parties,
  texts
}) => (
  <div className='text-list'>
    <ProgressiveList
      items={texts}
      key={listKey}
      keyOf={(text) => text.readings[0]?.number ?? 0}
      pageSize={TEXTS_PER_PAGE}
      renderItem={(text) => (
        <article className='text-entry'>
          <TextHeading text={text} />
          <ol className='text-readings'>
            {text.readings.map((vote, index) => (
              <Reading
                key={vote.number}
                kind={kind}
                parties={parties}
                previous={text.readings[index - 1]}
                vote={vote}
              />
            ))}
          </ol>
        </article>
      )}
    />
  </div>
)
