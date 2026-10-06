import type React from 'react'

import type { ScrutinKind } from '@on-record/protocol/votes/scrutin-kind'
import type { ScrutinOutcome } from '@on-record/protocol/votes/scrutin-outcome'
import type { VoteTotals } from '@on-record/protocol/votes/vote-totals'

import { dateOfDay } from '@/infrastructure/dates'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { OutcomeStamp } from './outcome-stamp'
import { ScrutinSubject } from './scrutin-subject'
import type { ScrutinTitle } from './scrutin-title'
import { ScrutinTitleDetail } from './scrutin-title-detail'

import './scrutin-register-line.sass'

type ScrutinRegisterLineProps = {
  /** What the surrounding list knows, such as one member's vote. */
  children?: React.ReactNode
  date: string
  /** The scrutin's own page. */
  href: string
  kind: ScrutinKind
  outcome: ScrutinOutcome
  /** How the chamber numbers it: « Scrutin n° 340 ». */
  reference: string
  title: ScrutinTitle
  totals: VoteTotals
}

/**
 * One scrutin of either chamber as a line of the register: its reference and
 * kind, its subject leading to the full record, what exactly was voted, and
 * the outcome with its totals.
 */
export const ScrutinRegisterLine: React.FC<ScrutinRegisterLineProps> = ({
  children,
  date,
  href,
  kind,
  outcome,
  reference,
  title,
  totals
}) => {
  const translate = useTranslate()

  return (
    <article className='scrutin-line'>
      <p className='scrutin-line-reference'>
        <span>{reference}</span>
        <span aria-hidden='true'>·</span>
        <time dateTime={date}>
          {translate('common.shortDay', { day: dateOfDay(date) })}
        </time>
        <span aria-hidden='true'>·</span>
        <span className={`scrutin-kind ${kind}`}>
          {translate(`scrutinKind.${kind}`)}
        </span>
      </p>
      <h3 className='scrutin-line-title'>
        <Link className='scrutin-line-link' href={href}>
          <ScrutinSubject title={title} />
        </Link>
      </h3>
      <ScrutinTitleDetail title={title} />
      <div className='scrutin-line-result'>
        <OutcomeStamp outcome={outcome} />
        <span className='scrutin-line-totals'>
          {kind === 'censure'
            ? translate('scrutin.totals.censure', { for: totals.for })
            : translate('scrutin.totals.vote', totals)}
        </span>
      </div>
      {children}
    </article>
  )
}
