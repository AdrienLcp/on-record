import type React from 'react'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import { dateOfDay } from '@/helpers/iso-day'
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
import {
  type ComparedText,
  censureMotionOf,
  readingStageOf,
  stanceLeftBehind
} from './text-readings'

import './text-list.sass'

const TEXTS_PER_PAGE = 10

const TextHeading: React.FC<{ kind: ComparedKind; text: ComparedText }> = ({
  kind,
  text
}) => {
  const translate = useTranslate()
  const [firstReading] = text.readings

  if (kind === 'solemn' || firstReading === undefined) {
    return (
      <header className='text-entry-head'>
        <h3 className='text-entry-name'>{text.name}</h3>
        <span className='text-entry-count'>
          {translate('compare.texts.readingCount', {
            count: text.readings.length
          })}
        </span>
      </header>
    )
  }

  const motion = censureMotionOf(firstReading.title)

  return (
    <header className='text-entry-head'>
      <h3 className='text-entry-name'>
        {translate(
          motion.afterForcedAdoption
            ? 'compare.texts.censure.afterForcedAdoption'
            : 'compare.texts.censure.plain'
        )}
      </h3>
      <p className='text-entry-detail'>
        {translate('compare.texts.censure.tabledBy', {
          authors: motion.authors
        })}
      </p>
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
  const stage = readingStageOf(vote.title) ?? 'none'

  return (
    <li className='text-reading'>
      <p className='text-reading-meta'>
        {kind === 'solemn' && (
          <span className='text-reading-stage'>
            {translate(`compare.texts.stage.${stage}`)}
          </span>
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
      keyOf={(text) => text.readings[0]?.number ?? text.name}
      pageSize={TEXTS_PER_PAGE}
      renderItem={(text) => (
        <article className='text-entry'>
          <TextHeading kind={kind} text={text} />
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
