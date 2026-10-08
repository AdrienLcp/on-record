import type React from 'react'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import { dateOfDay } from '@/infrastructure/dates'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ComparedPartyLabel } from './compared-party-label'
import {
  type ComparedKind,
  type ComparedParty,
  partyStanceOn
} from './party-comparison'
import { StanceMark } from './stance-mark'
import { stanceLeftBehind } from './text-readings'

import './text-reading.sass'

type TextReadingProps = {
  kind: ComparedKind
  parties: readonly ComparedParty[]
  previous: MajorVote | undefined
  vote: MajorVote
}

/**
 * One time the Assemblée voted a text: its stage, day and outcome, then each
 * compared party's stance, flagged when it moved since the previous reading.
 */
export const TextReading: React.FC<TextReadingProps> = ({
  kind,
  parties,
  previous,
  vote
}) => {
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
