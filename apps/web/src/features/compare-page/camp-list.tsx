import type React from 'react'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { ScrutinTitleDetail } from '@/features/scrutins/scrutin-title-detail'
import { dateOfDay } from '@/helpers/iso-day'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ComparedPartyLabel } from './compared-party-label'
import {
  type CampsOnVote,
  type ComparedKind,
  type ComparedParty,
  campsOn,
  type PartyStance
} from './party-comparison'
import { StanceMark } from './stance-mark'

import './camp-list.sass'

/** Each camp is washed in its vote bar colour; not voting a censure is the neutral side. */
const CAMP_TINTS: Partial<
  Record<PartyStance, 'abstention' | 'against' | 'for'>
> = {
  abstention: 'abstention',
  against: 'against',
  backed: 'for',
  for: 'for',
  someVoices: 'abstention'
}

const Camps: React.FC<CampsOnVote> = ({ aside, camps }) => {
  const translate = useTranslate()

  return (
    <ul className='camps' data-with-aside={aside.length > 0 || undefined}>
      {camps.map(({ parties, stance }) => (
        <li
          className='camp'
          data-empty={parties.length === 0 || undefined}
          data-tint={CAMP_TINTS[stance] ?? 'neutral'}
          key={stance}
        >
          <span className='camp-head'>
            <StanceMark stance={stance} />
          </span>
          {parties.length === 0 ? (
            <span className='camp-empty'>
              {translate('compare.camps.none')}
            </span>
          ) : (
            <ul className='camp-parties'>
              {parties.map((compared) => (
                <li key={compared.party.id}>
                  <ComparedPartyLabel compared={compared} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
      {aside.length > 0 && (
        <li className='camp' data-tint='neutral'>
          <span className='camp-head camp-aside-head'>
            {translate('compare.camps.aside')}
          </span>
          <ul className='camp-parties'>
            {aside.map(({ party, stance }) => (
              <li className='camp-aside-party' key={party.party.id}>
                <ComparedPartyLabel compared={party} />
                <StanceMark stance={stance} />
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  )
}

type CampListProps = {
  kind: ComparedKind
  parties: readonly ComparedParty[]
  votes: readonly MajorVote[]
}

/** One entry per vote: the compared parties filed under the side their group took. */
export const CampList: React.FC<CampListProps> = ({ kind, parties, votes }) => {
  const translate = useTranslate()

  return (
    <ol className='camp-list'>
      {votes.map((vote) => {
        const title = scrutinTitleOf(vote.title)

        return (
          <li className='camp-vote' key={vote.number}>
            <span className='camp-vote-meta'>
              <span className='camp-vote-reference'>
                {translate('scrutin.reference', { number: vote.number })}
              </span>
              <time dateTime={vote.date}>
                {translate('common.shortDay', { day: dateOfDay(vote.date) })}
              </time>
              <OutcomeStamp outcome={vote.outcome} />
            </span>
            <p className='camp-vote-title'>
              <ScrutinSubject title={title} />
            </p>
            <ScrutinTitleDetail title={title} />
            <Camps {...campsOn({ kind, parties, vote })} />
            <TextLink
              className='camp-vote-link'
              href={scrutinPathFor(vote.number)}
            >
              {translate('compare.scrutinLink', { number: vote.number })}
            </TextLink>
          </li>
        )
      })}
    </ol>
  )
}
