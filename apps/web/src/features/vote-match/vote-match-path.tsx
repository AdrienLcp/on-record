import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use, useEffect, useRef } from 'react'

import type { Comparison } from '@/features/compare-page/compare-loader'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import {
  useSearchValue,
  useSetSearchValues
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { PageIntro } from '@/presentation/components/page-intro'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  answersSearchValue,
  type MatchAnswer,
  type MatchAnswers,
  type MatchStep,
  matchedTextsOf,
  parseAnswers,
  withAnswer
} from './vote-match'
import { VoteMatchDisclosure } from './vote-match-disclosure'
import { VoteMatchIntro } from './vote-match-intro'
import { VoteMatchQuestion } from './vote-match-question'
import { VoteMatchResult } from './vote-match-result'
import { VOTE_MATCH_SELECTION } from './vote-match-selection'
import { parseStep, stepSearchValue } from './vote-match-step-search-value'

import './vote-match-path.sass'

type VoteMatchProps = {
  comparison: Promise<Result<Comparison, DatasetError>>
}

type Move = (change: { answers?: MatchAnswers; step: MatchStep }) => void

const QUESTION_COUNT = VOTE_MATCH_SELECTION.entries.length

/** The step after a text: the next one, or the result after the last. */
const stepAfter = (index: number): MatchStep =>
  index + 1 < QUESTION_COUNT
    ? { index: index + 1, kind: 'question' }
    : { kind: 'result' }

const PathStep: React.FC<{
  answers: MatchAnswers
  comparison: VoteMatchProps['comparison']
  move: Move
  step: Exclude<MatchStep, { kind: 'intro' }>
}> = ({ answers, comparison, move, step }) => {
  const result = use(comparison)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  const texts = matchedTextsOf({
    entries: VOTE_MATCH_SELECTION.entries,
    votes: result.data.votes
  })

  if (step.kind === 'result') {
    return (
      <VoteMatchResult
        answers={answers}
        groups={result.data.groups}
        onChangeAnswers={() => move({ step: { index: 0, kind: 'question' } })}
        texts={texts}
      />
    )
  }

  const text = texts[step.index]

  if (text === undefined) {
    return null
  }

  const answer = (chosen: MatchAnswer) =>
    move({
      answers: withAnswer({
        answer: chosen,
        answers,
        scrutin: text.entry.scrutin
      }),
      step: stepAfter(step.index)
    })

  return (
    <VoteMatchQuestion
      answer={answers.get(text.entry.scrutin)}
      count={texts.length}
      index={step.index}
      key={text.entry.scrutin}
      onAnswer={answer}
      onNext={() => move({ step: stepAfter(step.index) })}
      onPrevious={() =>
        move({
          step:
            step.index === 0
              ? { kind: 'intro' }
              : { index: step.index - 1, kind: 'question' }
        })
      }
      onShowResult={() => move({ step: { kind: 'result' } })}
      text={text}
    />
  )
}

/**
 * The guided path: one text at a time, the visitor's answer to each, then
 * their answers beside the race parties' votes. Every answer and the step
 * live in the URL, so a result can be shared and nothing is stored.
 */
export const VoteMatchPath: React.FC<VoteMatchProps> = ({ comparison }) => {
  const translate = useTranslate()
  const [answersValue] = useSearchValue('answers')
  const [stepValue] = useSearchValue('step')
  const setSearchValues = useSetSearchValues()
  const answers = parseAnswers(answersValue)
  const step = parseStep({ questionCount: QUESTION_COUNT, value: stepValue })
  const pathRef = useRef<HTMLDivElement>(null)
  const hasMoved = useRef(false)

  // After a move, the new step's heading takes the focus and comes into view:
  // the URL changes without a page load, so nothing else would tell a reader.
  useEffect(() => {
    if (!hasMoved.current || stepValue === null) {
      return
    }

    const heading = pathRef.current?.querySelector<HTMLElement>(
      '[data-step-heading]'
    )

    heading?.focus({ preventScroll: true })
    pathRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stepValue])

  const move: Move = (change) => {
    hasMoved.current = true
    setSearchValues({
      answers: answersSearchValue(change.answers ?? answers),
      step: stepSearchValue(change.step)
    })
  }

  return (
    <div className='vote-match-path' ref={pathRef}>
      <PageIntro
        lead={step.kind === 'intro' ? translate('voteMatch.lead') : undefined}
        title={translate('home.title')}
      >
        {step.kind === 'intro' && (
          <VoteMatchIntro
            count={QUESTION_COUNT}
            onStart={() => move({ step: { index: 0, kind: 'question' } })}
          />
        )}
      </PageIntro>
      {step.kind !== 'intro' && (
        <Suspense fallback={<LoadingLines lines={8} />}>
          <PathStep
            answers={answers}
            comparison={comparison}
            move={move}
            step={step}
          />
        </Suspense>
      )}
      {step.kind !== 'intro' && <VoteMatchDisclosure />}
    </div>
  )
}
