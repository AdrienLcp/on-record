import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { use } from 'react'

import type {
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'

import { GroupLabel } from '@/features/groups/group-label'
import { BallotMark } from '@/features/scrutins/ballot-mark'
import { VoteBar } from '@/features/scrutins/vote-bar'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { LOCALE } from '@/presentation/i18n/locale'

import {
  countedVotesOf,
  digestOf,
  GROUP_STANCES,
  type GroupStanceSection,
  groupStanceSectionsOf,
  groupsByCensureVotes,
  stanceOf
} from './group-stances'
import { groupAnchorOf, withoutVoteCountOf } from './scrutin-breakdown'
import type { ScrutinContext } from './scrutin-loader'

import './group-stances-summary.sass'

const LEGEND_POSITIONS = ['for', 'abstention', 'against'] as const

/** The figures in words: how many groups took each position, and how many members broke from theirs. */
const Digest: React.FC<{ scrutin: ScrutinDetail }> = ({ scrutin }) => {
  const translate = useTranslate()
  const digest = digestOf(scrutin)

  if (digest.kind === 'censure') {
    return (
      <p className='stances-digest'>
        {translate('scrutin.stances.censureDigest', {
          count: digest.censureGroupCount
        })}
      </p>
    )
  }

  const parts = GROUP_STANCES.filter(
    (stance) => digest.groupCountByStance[stance] > 0
  ).map((stance) =>
    translate('scrutin.stances.digestPart', {
      count: digest.groupCountByStance[stance],
      stance
    })
  )

  return (
    <p className='stances-digest'>
      {translate('scrutin.stances.digestLead', {
        parts: new Intl.ListFormat(LOCALE).format(parts)
      })}{' '}
      {translate('scrutin.stances.dissenters', {
        count: digest.dissenterCount
      })}
    </p>
  )
}

const StanceRow: React.FC<{
  context: ScrutinContext
  groupVote: GroupVote
  isCensure: boolean
}> = ({ context, groupVote, isCensure }) => {
  const translate = useTranslate()
  const fullCounts = isCensure
    ? translate('scrutin.totals.censure', { for: groupVote.totals.for })
    : `${translate('scrutin.totals.vote', groupVote.totals)} · ${translate(
        'scrutin.groups.withoutVote',
        { count: withoutVoteCountOf(groupVote) }
      )}`
  const isUncounted = !isCensure && stanceOf(groupVote) === 'none'

  return (
    <li>
      <a
        className='stance-row'
        href={`#${groupAnchorOf(groupVote.groupId)}`}
        title={fullCounts}
      >
        <GroupLabel group={context.groupById.get(groupVote.groupId) ?? null} />
        <VoteBar base={groupVote.memberCount} totals={groupVote.totals} />
        <span aria-hidden='true' className='stance-row-count'>
          {translate(
            isUncounted
              ? 'scrutin.stances.rowCast'
              : 'scrutin.stances.rowCount',
            {
              count: isCensure
                ? groupVote.totals.for
                : countedVotesOf(groupVote),
              members: groupVote.memberCount
            }
          )}
        </span>
        <VisuallyHidden elementType='span'>{fullCounts}</VisuallyHidden>
      </a>
    </li>
  )
}

const StanceSection: React.FC<{
  context: ScrutinContext
  section: GroupStanceSection
}> = ({ context, section }) => {
  const translate = useTranslate()

  return (
    <div className='stance-section'>
      <h4 className='stance-heading'>
        {section.stance !== 'none' && (
          <BallotMark position={section.stance} withLabel={false} />
        )}
        {translate(`scrutin.stances.heading.${section.stance}`)}
      </h4>
      <ol className='stance-rows'>
        {section.groups.map((groupVote) => (
          <StanceRow
            context={context}
            groupVote={groupVote}
            isCensure={false}
            key={groupVote.groupId}
          />
        ))}
      </ol>
    </div>
  )
}

/**
 * The groups filed under the position the Assemblée published for them, each
 * with the bar of its members' votes: who stood where, at a glance. Every row
 * leads to the group's detail further down the page.
 */
export const GroupStancesSummary: React.FC<{
  context: Promise<Result<ScrutinContext, DatasetError>>
  scrutin: ScrutinDetail
}> = ({ context, scrutin }) => {
  const translate = useTranslate()
  const result = use(context)
  const isCensure = scrutin.kind === 'censure'

  // The detail below the card reports a failure to load; saying it twice adds nothing.
  if (result.status === 'failure') {
    return null
  }

  return (
    <section className='group-stances-summary'>
      <h3 className='stances-title'>
        {translate(
          isCensure ? 'scrutin.stances.censureTitle' : 'scrutin.stances.title'
        )}
      </h3>
      <Digest scrutin={scrutin} />
      <p className='stances-legend'>
        {isCensure ? (
          translate('scrutin.stances.censureLead')
        ) : (
          <>
            {LEGEND_POSITIONS.map((position) => (
              <BallotMark key={position} position={position} />
            ))}
            <span className='empty-track-key'>
              <span aria-hidden='true' className='empty-track-swatch' />
              {translate('scrutin.stances.emptyTrack')}
            </span>
          </>
        )}
      </p>
      {isCensure ? (
        <ol className='stance-rows'>
          {groupsByCensureVotes(scrutin.groups).map((groupVote) => (
            <StanceRow
              context={result.data}
              groupVote={groupVote}
              isCensure
              key={groupVote.groupId}
            />
          ))}
        </ol>
      ) : (
        groupStanceSectionsOf(scrutin.groups).map((section) => (
          <StanceSection
            context={result.data}
            key={section.stance}
            section={section}
          />
        ))
      )}
    </section>
  )
}
