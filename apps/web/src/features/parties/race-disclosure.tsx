import type React from 'react'

import { dateOfDay } from '@/helpers/iso-day'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import { PRESIDENTIAL_RACE } from './presidential-race'

import './race-disclosure.sass'

/** Who chose the parties of the filter, on what criterion and when (principle 7). */
export const RaceDisclosure: React.FC = () => {
  const translate = useTranslate()
  const { polls } = PRESIDENTIAL_RACE

  return (
    <p className='race-disclosure'>
      <RichText
        parts={translate.rich('party.disclosure', {
          count: polls.count,
          from: dateOfDay(polls.from),
          polls: (children) => (
            <TextLink href={polls.sourceUrl} key='polls' target='_blank'>
              {children}
            </TextLink>
          ),
          strong: (children) => <strong key='strong'>{children}</strong>,
          threshold: PRESIDENTIAL_RACE.thresholdPercent,
          to: dateOfDay(polls.to),
          updatedOn: dateOfDay(PRESIDENTIAL_RACE.updatedOn)
        })}
      />
    </p>
  )
}
