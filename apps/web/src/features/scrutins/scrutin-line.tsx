import type React from 'react'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { dateOfDay } from '@/helpers/iso-day'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { OutcomeStamp } from './outcome-stamp'
import { ScrutinSubject } from './scrutin-subject'
import { scrutinTitleOf } from './scrutin-title'
import { ScrutinTitleDetail } from './scrutin-title-detail'

import './scrutin-line.sass'

type ScrutinLineProps = {
  children?: React.ReactNode
  scrutin: ScrutinSummary
}

/**
 * One scrutin as a line of the register: its reference and kind, its subject
 * leading to the full record, what exactly was voted, and the outcome with its
 * totals.
 * `children` adds what the surrounding list knows, such as one deputy's vote.
 */
export const ScrutinLine: React.FC<ScrutinLineProps> = ({
  children,
  scrutin
}) => {
  const translate = useTranslate()
  const title = scrutinTitleOf(scrutin.title)

  return (
    <article className='scrutin-line'>
      <p className='scrutin-line-reference'>
        <span>
          {translate('scrutin.reference', { number: scrutin.number })}
        </span>
        <span aria-hidden='true'>·</span>
        <time dateTime={scrutin.date}>
          {translate('common.shortDay', { day: dateOfDay(scrutin.date) })}
        </time>
        <span aria-hidden='true'>·</span>
        <span className={`scrutin-kind ${scrutin.kind}`}>
          {translate(`scrutinKind.${scrutin.kind}`)}
        </span>
      </p>
      <h3 className='scrutin-line-title'>
        <Link
          className='scrutin-line-link'
          href={scrutinPathFor(scrutin.number)}
        >
          <ScrutinSubject title={title} />
        </Link>
      </h3>
      <ScrutinTitleDetail title={title} />
      <div className='scrutin-line-result'>
        <OutcomeStamp outcome={scrutin.outcome} />
        <span className='scrutin-line-totals'>
          {scrutin.kind === 'censure'
            ? translate('scrutin.totals.censure', { for: scrutin.totals.for })
            : translate('scrutin.totals.vote', scrutin.totals)}
        </span>
      </div>
      {children}
    </article>
  )
}
