import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { SenateScrutinDetail } from '@on-record/protocol/senate/senate-scrutin'

import { CorrectionsCard } from '@/features/scrutins/corrections-card'
import { OfficialTitle } from '@/features/scrutins/official-title'
import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import { ScrutinTally } from '@/features/scrutins/scrutin-tally'
import { ScrutinTitleDetail } from '@/features/scrutins/scrutin-title-detail'
import {
  senateScrutinTitleOf,
  senateVoteObjectOf
} from '@/features/senate-scrutins/senate-title'
import { senatorFullNameOf } from '@/features/senators/senator'
import {
  officialSenateLegislativeFileUrl,
  officialSenateScrutinUrl
} from '@/features/sources/official-urls'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfDay } from '@/infrastructure/dates'
import { paths, senatorPathFor } from '@/infrastructure/router/navigation'
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
  senateScrutinPageTitle
} from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { SenateGroupBreakdown } from './senate-group-breakdown'
import { SenateNominalList } from './senate-nominal-list'
import {
  type SenateScrutinContext,
  useSenateScrutinData
} from './senate-scrutin-loader'

import './senate-scrutin-page.sass'

/** What was decided, in plain words, then the outcome and its totals. */
const WhatWasVoted: React.FC<{ scrutin: SenateScrutinDetail }> = ({
  scrutin
}) => {
  const translate = useTranslate()
  const object = senateVoteObjectOf(scrutin)

  return (
    <RecordCard
      className='what-was-voted'
      heading={translate('scrutin.result.title')}
      reference={<OutcomeStamp outcome={scrutin.outcome} size='large' />}
    >
      <div className='vote-meaning'>
        <p className='vote-object'>
          {translate(`senateScrutin.object.${object}.what`)}
        </p>
        <p className='vote-outcome'>
          {translate(`senateScrutin.object.${object}.${scrutin.outcome}`)}
        </p>
      </div>
      <ScrutinTally kind={scrutin.kind} totals={scrutin.totals} />
      <p className='record-note'>
        {translate(
          scrutin.kind === 'solemn'
            ? 'senateScrutin.kind.solemn'
            : 'senateScrutin.kind.ordinary'
        )}
      </p>
      {scrutin.kind === 'ordinary' && (
        <p className='record-note'>{translate('senateScrutin.groupVoting')}</p>
      )}
      <p className='record-note'>{translate('scrutin.object.disclosure')}</p>
    </RecordCard>
  )
}

const Sources: React.FC<{ scrutin: SenateScrutinDetail }> = ({ scrutin }) => {
  const translate = useTranslate()

  return (
    <ul className='scrutin-sources'>
      <li>
        <TextLink href={officialSenateScrutinUrl(scrutin)} target='_blank'>
          {translate('senateScrutin.officialPage')}
        </TextLink>
      </li>
      {scrutin.legislativeFile !== null && (
        <li>
          <TextLink
            href={officialSenateLegislativeFileUrl(scrutin.legislativeFile.id)}
            target='_blank'
          >
            {translate('senateScrutin.legislativeFile', {
              title: scrutin.legislativeFile.title
            })}
          </TextLink>
        </li>
      )}
    </ul>
  )
}

const Corrections: React.FC<{
  context: SenateScrutinContext
  scrutin: SenateScrutinDetail
}> = ({ context, scrutin }) => {
  const translate = useTranslate()
  const recordedPositionOf = new Map(
    scrutin.groups.flatMap((groupVote) =>
      groupVote.ballots.map(
        (ballot) => [ballot.senatorId, ballot.position] as const
      )
    )
  )

  return (
    <CorrectionsCard
      lead={translate('senateScrutin.corrections.lead')}
      lines={scrutin.corrections.map((correction) => {
        const senator = context.senatorsById.get(correction.senatorId)

        return {
          href: senatorPathFor(correction.senatorId),
          id: correction.senatorId,
          intended: correction.intended,
          name:
            senator === undefined
              ? correction.senatorId
              : senatorFullNameOf(senator),
          recorded: recordedPositionOf.get(correction.senatorId) ?? null
        }
      })}
    />
  )
}

/** The parts that put names on the ids: they wait for the senators and groups. */
const ScrutinDetails: React.FC<{
  context: Promise<Result<SenateScrutinContext, DatasetError>>
  scrutin: SenateScrutinDetail
}> = ({ context, scrutin }) => {
  const result = use(context)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  return (
    <>
      <SenateGroupBreakdown context={result.data} scrutin={scrutin} />
      {scrutin.corrections.length > 0 && (
        <Corrections context={result.data} scrutin={scrutin} />
      )}
      <SenateNominalList context={result.data} scrutin={scrutin} />
    </>
  )
}

const ScrutinRecord: React.FC = () => {
  const translate = useTranslate()
  const { context, requested, scrutin } = useSenateScrutinData()
  const result = use(scrutin)

  if (result.status === 'failure') {
    return (
      <>
        <DocumentTitle>
          {documentTitleFor(translate('senateScrutins.title'))}
        </DocumentTitle>
        <DatasetFailure
          error={result.error}
          missingMessage={translate('senateScrutin.missing')}
        />
        {result.error === 'missing' && requested !== null && (
          <TextLink href={officialSenateScrutinUrl(requested)} target='_blank'>
            {translate('senateScrutin.officialPage')}
          </TextLink>
        )}
      </>
    )
  }

  const record = result.data
  const title = senateScrutinTitleOf(record.title)

  return (
    <>
      <DocumentTitle>
        {documentTitleFor(senateScrutinPageTitle(record.title))}
      </DocumentTitle>
      <PageIntro
        before={
          <BackLink href={paths.senateScrutins}>
            {translate('senateScrutin.allScrutins')}
          </BackLink>
        }
        title={<ScrutinSubject title={title} />}
      >
        <p className='scrutin-reference'>
          <span>
            {translate('senateScrutin.reference', {
              nextYear: record.session + 1,
              number: record.number,
              session: record.session
            })}
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
      <WhatWasVoted scrutin={record} />
      <p className='record-note'>{translate('senateScrutin.nominalOnly')}</p>
      <Sources scrutin={record} />
      <Suspense fallback={<LoadingLines lines={6} />}>
        <ScrutinDetails context={context} scrutin={record} />
      </Suspense>
    </>
  )
}

export const SenateScrutinPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='senate-scrutin-page'>
      <Suspense
        fallback={
          <>
            <DocumentTitle>
              {documentTitleFor(translate('senateScrutins.title'))}
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
