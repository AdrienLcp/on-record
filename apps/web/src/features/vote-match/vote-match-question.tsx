import type React from 'react'
import { useId } from 'react'

import { BallotMark } from '@/features/scrutins/ballot-mark'
import { scrutinSubjectText } from '@/features/scrutins/scrutin-subject-text'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { ScrutinTitleDetail } from '@/features/scrutins/scrutin-title-detail'
import { dateOfDay } from '@/helpers/iso-day'
import { RecordCard } from '@/presentation/components/record-card'
import { Button } from '@/presentation/components/ui/button'
import {
  ToggleChip,
  ToggleChipGroup
} from '@/presentation/components/ui/toggle-chip-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { MATCH_ANSWERS, type MatchAnswer, type MatchedText } from './vote-match'

import './vote-match-question.sass'

type VoteMatchQuestionProps = {
  answer: MatchAnswer | undefined
  count: number
  index: number
  onAnswer: (answer: MatchAnswer) => void
  onNext: () => void
  onPrevious: () => void
  onShowResult: () => void
  text: MatchedText
}

const isMatchAnswer = (key: unknown): key is MatchAnswer =>
  MATCH_ANSWERS.some((answer) => answer === key)

/**
 * One text as a card: what it is about and what it did, in one sentence, and
 * the visitor's answer. The outcome and the parties' votes stay hidden until
 * the result, so they cannot steer the answer.
 */
export const VoteMatchQuestion: React.FC<VoteMatchQuestionProps> = ({
  answer,
  count,
  index,
  onAnswer,
  onNext,
  onPrevious,
  onShowResult,
  text
}) => {
  const translate = useTranslate()
  const askId = useId()
  const title = scrutinTitleOf(text.vote.title)
  const { topic } = text.entry

  return (
    <div className='vote-match-question'>
      <div className='vote-match-progress'>
        <p className='vote-match-progress-label'>
          {translate('voteMatch.progress', {
            count,
            position: index + 1
          })}
        </p>
        <Button className='inline-action' onPress={onShowResult}>
          {translate('voteMatch.showResultNow')}
        </Button>
        <ol aria-hidden='true' className='vote-match-progress-track'>
          {Array.from({ length: count }, (_, position) => position).map(
            (position) => (
              <li
                className={
                  position < index
                    ? 'done'
                    : position === index
                      ? 'current'
                      : undefined
                }
                key={position}
              />
            )
          )}
        </ol>
      </div>
      <RecordCard
        className='vote-match-card'
        heading={
          <span data-step-heading tabIndex={-1}>
            {scrutinSubjectText({ title, translate })}
          </span>
        }
        reference={translate(`voteMatch.topics.${topic}.name`)}
      >
        <p className='vote-match-summary'>
          {translate(`voteMatch.topics.${topic}.summary`)}
        </p>
        <p className='vote-match-detail'>
          <ScrutinTitleDetail title={title} />
          <span className='vote-match-reference'>
            {translate('scrutin.reference', { number: text.vote.number })}
            {' · '}
            {translate('voteMatch.votedOn', {
              day: dateOfDay(text.vote.date)
            })}
          </span>
        </p>
        <p className='vote-match-ask' id={askId}>
          {translate('voteMatch.question')}
        </p>
        <ToggleChipGroup
          aria-labelledby={askId}
          className='vote-match-answers'
          onSelectionChange={(keys) => {
            const [key] = keys
            if (isMatchAnswer(key)) {
              onAnswer(key)
            }
          }}
          selectedKeys={answer === undefined ? [] : [answer]}
          selectionMode='single'
        >
          {MATCH_ANSWERS.map((each) => (
            <ToggleChip
              className={each === 'unsure' ? 'unsure' : undefined}
              id={each}
              key={each}
            >
              {each === 'unsure' ? (
                translate('voteMatch.answers.unsure')
              ) : (
                <BallotMark position={each} />
              )}
            </ToggleChip>
          ))}
        </ToggleChipGroup>
        <p className='vote-match-note'>
          {translate('voteMatch.hiddenUntilResult')}
        </p>
      </RecordCard>
      <div className='vote-match-steps'>
        <Button onPress={onPrevious}>{translate('voteMatch.previous')}</Button>
        <Button onPress={onNext}>
          {index + 1 === count
            ? translate('voteMatch.showResult')
            : translate(
                answer === undefined
                  ? 'voteMatch.next'
                  : 'voteMatch.nextAnswered'
              )}
        </Button>
      </div>
    </div>
  )
}
