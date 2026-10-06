import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf } from '@/features/deputies/deputy'
import { PartyFilter } from '@/features/parties/party-filter'
import { RaceDisclosure } from '@/features/parties/race-disclosure'
import { usePartySelection } from '@/features/parties/use-party-selection'
import { CorrectionsCard } from '@/features/scrutins/corrections-card'
import { OfficialTitle } from '@/features/scrutins/official-title'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import { ScrutinTally } from '@/features/scrutins/scrutin-tally'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { ScrutinTitleDetail } from '@/features/scrutins/scrutin-title-detail'
import { voteObjectOf } from '@/features/scrutins/vote-object'
import {
  officialLegislativeFileUrl,
  officialScrutinUrl
} from '@/features/sources/official-urls'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfDay } from '@/infrastructure/dates'
import { deputyPathFor, paths } from '@/infrastructure/router/navigation'
import { BackLink } from '@/presentation/components/back-link'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import {
  documentTitleFor,
  scrutinPageTitle
} from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { GroupBreakdown } from './group-breakdown'
import { GroupStancesSummary } from './group-stances-summary'
import { NominalList } from './nominal-list'
import { type ScrutinContext, useScrutinData } from './scrutin-loader'

import './scrutin-page.sass'

/** The party chips over the whole page: stances, group detail and nominal list. */
const ScrutinPartyFilter: React.FC<{
  context: Promise<Result<ScrutinContext, DatasetError>>
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const result = use(context)
  const selection = usePartySelection()

  // The detail below reports a failure to load; the filter has nothing to file.
  if (result.status === 'failure') {
    return null
  }

  const groups = scrutin.groups.flatMap((groupVote) => {
    const group = result.data.groupById.get(groupVote.groupId)

    return group === undefined ? [] : [group]
  })

  return (
    <>
      <PartyFilter
        className='scrutin-party-filter'
        groups={groups}
        selection={selection}
      />
      <RaceDisclosure />
    </>
  )
}

/** What was decided, in plain words, then the outcome and its totals. */
const WhatWasVoted: React.FC<{
  context: Promise<Result<ScrutinContext, DatasetError>>
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const translate = useTranslate()
  const object = voteObjectOf(scrutin)

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
      </div>
      <ScrutinTally kind={scrutin.kind} totals={scrutin.totals} />
      <Suspense fallback={<LoadingLines lines={4} />}>
        <GroupStancesSummary context={context} scrutin={scrutin} />
      </Suspense>
      <p className='record-note'>{translate(`scrutin.kind.${scrutin.kind}`)}</p>
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
    <CorrectionsCard
      lead={translate('scrutin.corrections.lead')}
      lines={scrutin.corrections.map((correction) => {
        const deputy = context.deputiesById.get(correction.deputyId)

        return {
          href: deputyPathFor(correction.deputyId),
          id: correction.deputyId,
          intended: correction.intended,
          name: deputy === undefined ? correction.deputyId : fullNameOf(deputy),
          recorded: recordedPositionOf.get(correction.deputyId) ?? null
        }
      })}
    />
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

  if (result.status === 'failure') {
    return (
      <>
        <DocumentTitle>
          {documentTitleFor(translate('scrutins.title'))}
        </DocumentTitle>
        <DatasetFailure
          error={result.error}
          missingMessage={translate('scrutin.missing')}
        />
      </>
    )
  }

  const record = result.data
  const title = scrutinTitleOf(record.title)

  return (
    <>
      <DocumentTitle>
        {documentTitleFor(scrutinPageTitle(record.title))}
      </DocumentTitle>
      <PageIntro
        before={
          <BackLink href={paths.scrutins}>
            {translate('scrutin.allScrutins')}
          </BackLink>
        }
        title={<ScrutinSubject title={title} />}
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
        <ScrutinTitleDetail title={title} />
        <OfficialTitle official={record.title} title={title} />
      </PageIntro>
      <Suspense fallback={null}>
        <ScrutinPartyFilter context={context} scrutin={record} />
      </Suspense>
      <WhatWasVoted context={context} scrutin={record} />
      <p className='record-note'>{translate('common.nominalOnly')}</p>
      <Suspense fallback={<LoadingLines lines={6} />}>
        <ScrutinDetails context={context} scrutin={record} />
      </Suspense>
    </>
  )
}

export const ScrutinPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='scrutin-page'>
      <Suspense
        fallback={
          <>
            <DocumentTitle>
              {documentTitleFor(translate('scrutins.title'))}
            </DocumentTitle>
            <LoadingLines lines={6} />
          </>
        }
      >
        <ScrutinRecord />
      </Suspense>
    </Main>
  )
}
