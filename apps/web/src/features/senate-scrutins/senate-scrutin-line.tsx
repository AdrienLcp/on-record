import type React from 'react'

import type { SenateScrutinSummary } from '@on-record/protocol/senate/senate-scrutin'

import { ScrutinRegisterLine } from '@/features/scrutins/scrutin-register-line'
import { senateScrutinPathFor } from '@/infrastructure/router/navigation'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { senateScrutinTitleOf } from './senate-title'

type SenateScrutinLineProps = {
  children?: React.ReactNode
  scrutin: SenateScrutinSummary
}

/**
 * One Senate scrutin as a line of the register, numbered within its session.
 * `children` adds what the surrounding list knows, such as one senator's vote.
 */
export const SenateScrutinLine: React.FC<SenateScrutinLineProps> = ({
  children,
  scrutin
}) => {
  const translate = useTranslate()

  return (
    <ScrutinRegisterLine
      date={scrutin.date}
      href={senateScrutinPathFor(scrutin.id)}
      kind={scrutin.kind}
      outcome={scrutin.outcome}
      reference={translate('senateScrutin.reference', {
        nextYear: scrutin.session + 1,
        number: scrutin.number,
        session: scrutin.session
      })}
      title={senateScrutinTitleOf(scrutin.title)}
      totals={scrutin.totals}
    >
      {children}
    </ScrutinRegisterLine>
  )
}
