import type React from 'react'

import type { DeputyId } from '@on-record/protocol/assembly/official-ids'

import { deputyPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  agreementOf,
  type DeputyVoteLine,
  participationOf
} from './deputy-votes'

import './deputy-figures.sass'

type DeputyFiguresProps = {
  deputyId: DeputyId
  lines: readonly DeputyVoteLine[]
}

/**
 * The two figures the record supports, each with the votes it counts one
 * click away and the sentence that keeps it from being read as a grade.
 */
export const DeputyFigures: React.FC<DeputyFiguresProps> = ({
  deputyId,
  lines
}) => {
  const translate = useTranslate()
  const participation = participationOf(lines)
  const agreement = agreementOf(lines)

  return (
    <RecordCard className='deputy-figures' heading={translate('deputy.record')}>
      <div className='figures'>
        <section className='figure'>
          <h3 className='figure-title'>
            {translate('deputy.participation.title')}
          </h3>
          {participation.total === 0 ? (
            <p className='record-note'>
              {translate('deputy.participation.none')}
            </p>
          ) : (
            <>
              <p className='figure-value'>
                {translate('common.share', {
                  share: participation.recorded / participation.total
                })}
              </p>
              <p className='figure-counts'>
                <TextLink
                  href={deputyPathFor(deputyId, { ballot: 'recorded' })}
                >
                  {translate('deputy.participation.recorded', {
                    count: participation.recorded
                  })}
                </TextLink>{' '}
                {translate('deputy.participation.total', {
                  count: participation.total
                })}
                {' · '}
                <TextLink
                  href={deputyPathFor(deputyId, { ballot: 'notRecorded' })}
                >
                  {translate('deputy.participation.notRecorded', {
                    count: participation.notRecorded
                  })}
                </TextLink>
              </p>
            </>
          )}
          <p className='record-note'>
            {translate('deputy.participation.context')}
          </p>
        </section>
        <section className='figure'>
          <h3 className='figure-title'>
            {translate('deputy.agreement.title')}
          </h3>
          {agreement.comparable === 0 ? (
            <p className='record-note'>{translate('deputy.agreement.none')}</p>
          ) : (
            <>
              <p className='figure-value'>
                {translate('common.share', {
                  share: agreement.matching / agreement.comparable
                })}
              </p>
              <p className='figure-counts'>
                <TextLink
                  href={deputyPathFor(deputyId, { ballot: 'withGroup' })}
                >
                  {translate('deputy.agreement.matching', {
                    count: agreement.matching
                  })}
                </TextLink>
                {' · '}
                <TextLink
                  href={deputyPathFor(deputyId, { ballot: 'againstGroup' })}
                >
                  {translate('deputy.agreement.differing', {
                    count: agreement.differing
                  })}
                </TextLink>
              </p>
            </>
          )}
          <p className='record-note'>{translate('deputy.agreement.context')}</p>
        </section>
      </div>
      <p className='record-note'>{translate('common.nominalOnly')}</p>
    </RecordCard>
  )
}
