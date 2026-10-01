import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { BallotMark } from '@/features/scrutins/ballot-mark'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import {
  officialLegislativeFileUrl,
  officialScrutinUrl
} from '@/features/sources/official-urls'
import { dateOfDay } from '@/helpers/iso-day'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { deputyPathFor, paths } from '@/infrastructure/router/navigation'
import { BackLink } from '@/presentation/components/back-link'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { GroupBreakdown } from './group-breakdown'
import { NominalList } from './nominal-list'
import { type ScrutinContext, useScrutinData } from './scrutin-loader'
import { VoteBar } from './vote-bar'

import './scrutin-page.sass'

const TALLY_POSITIONS = ['for', 'against', 'abstention', 'nonVoting'] as const

/** What was decided, in plain words, then the outcome and its totals. */
const WhatWasVoted: React.FC<{ scrutin: ScrutinDetail }> = ({ scrutin }) => {
  const translate = useTranslate()
  const object = voteObjectOf(scrutin)
  const votesCast =
    scrutin.totals.for + scrutin.totals.against + scrutin.totals.abstention

  return (
    <RecordCard
      className='what-was-voted'
      heading={translate('scrutin.result.title')}
      reference={<OutcomeStamp outcome={scrutin.outcome} size='large' />}
    >
      <div className='vote-meaning'>
        <p className='vote-object'>
          {translate(`scrutin.object.${object}.what`)}
        </p>
        <p className='vote-outcome'>
          {translate(`scrutin.object.${object}.${scrutin.outcome}`)}
        </p>
        <p className='record-note'>
          {translate(`scrutin.kind.${scrutin.kind}`)}
        </p>
      </div>
      <dl className='tally'>
        {TALLY_POSITIONS.filter(
          (position) => scrutin.kind !== 'censure' || position === 'for'
        ).map((position) => (
          <div className='tally-entry' key={position}>
            <dt>
              <BallotMark position={position} />
            </dt>
            <dd className='tally-count'>{scrutin.totals[position]}</dd>
          </div>
        ))}
      </dl>
      {scrutin.kind !== 'censure' && (
        <VoteBar base={votesCast} totals={scrutin.totals} />
      )}
      {scrutin.requester !== null && (
        <p className='record-note'>
          {translate('scrutin.requester', { requester: scrutin.requester })}
        </p>
      )}
      <p className='record-note'>{translate('scrutin.object.disclosure')}</p>
    </RecordCard>
  )
}

const Corrections: React.FC<{
  context: ScrutinContext
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const translate = useTranslate()
  const recordedPositionOf = new Map(
    scrutin.groups.flatMap((groupVote) =>
      groupVote.ballots.map(
        (ballot) => [ballot.deputyId, ballot.position] as const
      )
    )
  )

  return (
    <RecordCard
      className='corrections'
      heading={translate('scrutin.corrections.title')}
    >
      <p className='record-note'>{translate('scrutin.corrections.lead')}</p>
      <ul className='ruled-list'>
        {scrutin.corrections.map((correction) => {
          const deputy = context.deputiesById.get(correction.deputyId)
          const recorded = recordedPositionOf.get(correction.deputyId)

          return (
            <li className='correction-entry' key={correction.deputyId}>
              <TextLink href={deputyPathFor(correction.deputyId)}>
                {deputy === undefined
                  ? correction.deputyId
                  : `${deputy.firstName} ${deputy.lastName}`}
              </TextLink>
              <span className='correction-detail'>
                {recorded !== undefined &&
                  translate('scrutin.corrections.recorded', { recorded })}
                {recorded !== undefined && ' · '}
                {translate('scrutin.corrections.intended', {
                  intended: correction.intended
                })}
              </span>
            </li>
          )
        })}
      </ul>
    </RecordCard>
  )
}

const Sources: React.FC<{
  context: ScrutinContext
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const translate = useTranslate()

  return (
    <ul className='scrutin-sources'>
      <li>
        <TextLink
          href={officialScrutinUrl({
            legislature: context.legislature,
            scrutinNumber: scrutin.number
          })}
          target='_blank'
        >
          {translate('scrutin.officialPage')}
        </TextLink>
      </li>
      {scrutin.legislativeFileId !== null && (
        <li>
          <TextLink
            href={officialLegislativeFileUrl({
              legislativeFileId: scrutin.legislativeFileId,
              legislature: context.legislature
            })}
            target='_blank'
          >
            {translate('scrutin.legislativeFile')}
          </TextLink>
        </li>
      )}
    </ul>
  )
}

/** The parts that put names on the ids: they wait for the deputies and groups. */
const ScrutinDetails: React.FC<{
  context: Promise<Result<ScrutinContext, DatasetError>>
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const result = use(context)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  return (
    <>
      <Sources context={result.data} scrutin={scrutin} />
      <GroupBreakdown context={result.data} scrutin={scrutin} />
      {scrutin.corrections.length > 0 && (
        <Corrections context={result.data} scrutin={scrutin} />
      )}
      <NominalList context={result.data} scrutin={scrutin} />
    </>
  )
}

const ScrutinRecord: React.FC = () => {
  const translate = useTranslate()
  const { context, scrutin } = useScrutinData()
  const result = use(scrutin)

  useDocumentTitle(
    result.status === 'success'
      ? translate('scrutin.reference', { number: result.data.number })
      : translate('scrutins.title')
  )

  if (result.status === 'failure') {
    return (
      <DatasetFailure
        error={result.error}
        missingMessage={translate('scrutin.missing')}
      />
    )
  }

  const record = result.data

  return (
    <>
      <PageIntro
        before={
          <BackLink href={paths.scrutins}>
            {translate('scrutin.allScrutins')}
          </BackLink>
        }
        title={<span className='official-title'>{record.title}</span>}
      >
        <p className='scrutin-reference'>
          <span>
            {translate('scrutin.reference', { number: record.number })}
          </span>
          <span aria-hidden='true'>·</span>
          <time dateTime={record.date}>
            {translate('common.day', { day: dateOfDay(record.date) })}
          </time>
          <span aria-hidden='true'>·</span>
          <span>{translate(`scrutinKind.${record.kind}`)}</span>
        </p>
      </PageIntro>
      <WhatWasVoted scrutin={record} />
      <p className='record-note'>{translate('common.nominalOnly')}</p>
      <Suspense fallback={<LoadingLines lines={6} />}>
        <ScrutinDetails context={context} scrutin={record} />
      </Suspense>
    </>
  )
}

export const ScrutinPage: React.FC = () => (
  <Main className='scrutin-page'>
    <Suspense fallback={<LoadingLines lines={6} />}>
      <ScrutinRecord />
    </Suspense>
  </Main>
)
