import type React from 'react'
import { useId } from 'react'

import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'
import type { Group } from '@on-record/protocol/assembly/group'

import { ComparedPartyLabel } from '@/features/compare-page/compared-party-label'
import type { ComparedParty } from '@/features/compare-page/party-comparison'
import { PRESIDENTIAL_RACE } from '@/features/parties/presidential-race'
import { BallotMark } from '@/features/scrutins/ballot-mark'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { scrutinSubjectText } from '@/features/scrutins/scrutin-subject-text'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { TextKindTag } from '@/features/scrutins/text-kind-tag'
import { dateOfDay } from '@/infrastructure/dates'
import { paths, scrutinPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { Button } from '@/presentation/components/ui/button'
import { Link } from '@/presentation/components/ui/link'
import { TextLink } from '@/presentation/components/ui/text-link'
import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  countedTextsOf,
  groupVoteOn,
  isSameChoice,
  type MatchAnswer,
  type MatchAnswers,
  type MatchedText,
  sameChoiceCountOf
} from './vote-match'

import './vote-match-result.sass'

type VoteMatchResultProps = {
  answers: MatchAnswers
  groups: readonly Group[]
  onChangeAnswers: () => void
  texts: readonly MatchedText[]
}

const CHECK_PATH = 'M5 10.5l3.2 3.2L15 7'

/** What a text is about, as a reader names it. */
const useSubjectOf = (): ((text: MatchedText) => string) => {
  const translate = useTranslate()

  return (text) =>
    scrutinSubjectText({ title: scrutinTitleOf(text.vote.title), translate })
}

/** One square per counted text, filled where the party made the visitor's choice. */
const SameChoiceRows: React.FC<{
  answers: MatchAnswers
  counted: readonly MatchedText[]
  parties: readonly ComparedParty[]
}> = ({ answers, counted, parties }) => {
  const translate = useTranslate()
  const subjectOf = useSubjectOf()

  return (
    <>
      <ul className='ruled-list same-choice-rows'>
        {parties.map((compared) => (
          <li className='same-choice-row' key={compared.party.id}>
            <ComparedPartyLabel compared={compared} />
            <span className='same-choice-squares'>
              {counted.map((text) => {
                const isSame = isSameChoice({
                  answer: answers.get(text.entry.scrutin),
                  groupVote: groupVoteOn({
                    groupId: compared.party.groupId,
                    vote: text.vote
                  })
                })

                return (
                  <Link
                    aria-label={translate('voteMatch.result.sameChoiceOn', {
                      same: isSame ? 'true' : 'false',
                      subject: subjectOf(text)
                    })}
                    className={
                      isSame ? 'same-choice-square same' : 'same-choice-square'
                    }
                    href={scrutinPathFor(text.vote.number)}
                    key={text.entry.scrutin}
                  >
                    {isSame && (
                      <svg
                        aria-hidden='true'
                        focusable='false'
                        height='14'
                        viewBox='0 0 20 20'
                        width='14'
                      >
                        <path d={CHECK_PATH} />
                      </svg>
                    )}
                  </Link>
                )
              })}
            </span>
            <span className='same-choice-count'>
              {translate('voteMatch.result.sameChoiceCount', {
                count: counted.length,
                same: sameChoiceCountOf({
                  answers,
                  groupId: compared.party.groupId,
                  texts: counted
                })
              })}
            </span>
          </li>
        ))}
      </ul>
      <p className='record-note same-choice-legend'>
        <span aria-hidden='true' className='same-choice-square same' />
        {translate('voteMatch.result.legendSame')}
        <span aria-hidden='true' className='same-choice-square' />
        {translate('voteMatch.result.legendOther')}
        <span>{translate('voteMatch.result.squaresLead')}</span>
      </p>
    </>
  )
}

const VisitorAnswer: React.FC<{ answer: MatchAnswer | undefined }> = ({
  answer
}) => {
  const translate = useTranslate()

  if (answer === undefined) {
    return (
      <span className='vote-match-no-mark'>
        {translate('voteMatch.result.notAnswered')}
      </span>
    )
  }

  return answer === 'unsure' ? (
    <span className='vote-match-no-mark'>
      {translate('voteMatch.answers.unsure')}
    </span>
  ) : (
    <BallotMark position={answer} />
  )
}

const PartyVote: React.FC<{
  answer: MatchAnswer | undefined
  compared: ComparedParty
  text: MatchedText
}> = ({ answer, compared, text }) => {
  const translate = useTranslate()
  const stance = text.vote.groups.find(
    (group) => group.groupId === compared.party.groupId
  )
  const groupVote: BallotPosition | null | undefined = groupVoteOn({
    groupId: compared.party.groupId,
    vote: text.vote
  })
  const isSame = isSameChoice({ answer, groupVote })

  return (
    <div className={isSame ? 'party-vote same' : 'party-vote'}>
      <ComparedPartyLabel compared={compared} />
      {groupVote === undefined || groupVote === null ? (
        <span className='vote-match-no-mark'>
          {translate(
            groupVote === undefined
              ? 'voteMatch.result.notSitting'
              : 'voteMatch.result.noMajority'
          )}
        </span>
      ) : (
        <BallotMark position={groupVote} />
      )}
      {isSame && (
        <VisuallyHidden elementType='span'>
          {translate('voteMatch.result.legendSame')}
        </VisuallyHidden>
      )}
      {stance !== undefined && (
        <span className='party-vote-counts'>
          {translate('voteMatch.result.groupCounts', {
            abstention: stance.totals.abstention,
            against: stance.totals.against,
            for: stance.totals.for,
            members: stance.memberCount
          })}
        </span>
      )}
    </div>
  )
}

/** Each text with the visitor's answer beside every party's vote and its counts. */
const ByTextList: React.FC<{
  answers: MatchAnswers
  parties: readonly ComparedParty[]
  texts: readonly MatchedText[]
}> = ({ answers, parties, texts }) => {
  const translate = useTranslate()
  const subjectOf = useSubjectOf()

  return (
    <ol className='ruled-list by-text-list'>
      {texts.map((text) => {
        const answer = answers.get(text.entry.scrutin)
        const title = scrutinTitleOf(text.vote.title)

        return (
          <li className='by-text-entry' key={text.entry.scrutin}>
            <div className='by-text-head'>
              <h3 className='by-text-subject'>
                <TextLink href={scrutinPathFor(text.vote.number)}>
                  {subjectOf(text)}
                </TextLink>
              </h3>
              <p className='by-text-meta'>
                {title.kind === 'text' && (
                  <TextKindTag textKind={title.textKind} />
                )}
                <OutcomeStamp outcome={text.vote.outcome} />
                <span className='by-text-reference'>
                  {translate('scrutin.reference', {
                    number: text.vote.number
                  })}
                  {' · '}
                  {translate('voteMatch.votedOn', {
                    day: dateOfDay(text.vote.date)
                  })}
                </span>
              </p>
            </div>
            <div className='by-text-votes'>
              <div className='party-vote visitor'>
                <span className='visitor-label'>
                  {translate('voteMatch.result.you')}
                </span>
                <VisitorAnswer answer={answer} />
              </div>
              {parties.map((compared) => (
                <PartyVote
                  answer={answer}
                  compared={compared}
                  key={compared.party.id}
                  text={text}
                />
              ))}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The visitor's answers beside the race parties' votes: first how often each
 * party made the same choice, in the race list's order and never sorted by
 * it, then every text with each vote and the counts it comes from.
 */
export const VoteMatchResult: React.FC<VoteMatchResultProps> = ({
  answers,
  groups,
  onChangeAnswers,
  texts
}) => {
  const translate = useTranslate()
  const headingId = useId()
  const counted = countedTextsOf({ answers, texts })
  const parties: ComparedParty[] = PRESIDENTIAL_RACE.parties.map((party) => ({
    group: groups.find((group) => group.id === party.groupId),
    party
  }))

  const actions = (
    <div className='vote-match-actions'>
      <Button onPress={onChangeAnswers}>
        {translate(
          counted.length === 0
            ? 'voteMatch.empty.action'
            : 'voteMatch.result.change'
        )}
      </Button>
      <TextLink href={paths.compare}>{translate('voteMatch.compare')}</TextLink>
    </div>
  )

  if (counted.length === 0) {
    return (
      <RecordCard
        className='vote-match-result'
        heading={translate('voteMatch.empty.title')}
      >
        <p className='vote-match-empty' data-step-heading tabIndex={-1}>
          {translate('voteMatch.empty.text')}
        </p>
        {actions}
      </RecordCard>
    )
  }

  return (
    <section aria-labelledby={headingId} className='vote-match-result'>
      <header className='vote-match-result-head'>
        <h2
          className='vote-match-result-title'
          data-step-heading
          id={headingId}
          tabIndex={-1}
        >
          {translate('voteMatch.result.title')}
        </h2>
        <p className='vote-match-result-lead'>
          {translate('voteMatch.result.lead', { count: counted.length })}
        </p>
      </header>
      <RecordCard
        heading={translate('voteMatch.result.sameChoice')}
        headingLevel={3}
        reference={translate('voteMatch.result.textCount', {
          count: counted.length
        })}
      >
        <SameChoiceRows answers={answers} counted={counted} parties={parties} />
      </RecordCard>
      <RecordCard
        heading={translate('voteMatch.result.byText')}
        headingLevel={3}
        reference={translate('voteMatch.result.textCount', {
          count: texts.length
        })}
      >
        <ByTextList answers={answers} parties={parties} texts={texts} />
        <p className='record-note'>{translate('common.nominalOnly')}</p>
      </RecordCard>
      {actions}
    </section>
  )
}
