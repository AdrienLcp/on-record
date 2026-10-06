import type React from 'react'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { ScrutinRegisterLine } from './scrutin-register-line'
import { scrutinTitleOf } from './scrutin-title'

type ScrutinLineProps = {
  children?: React.ReactNode
  scrutin: ScrutinSummary
}

/**
 * One Assemblée scrutin as a line of the register.
 * `children` adds what the surrounding list knows, such as one deputy's vote.
 */
export const ScrutinLine: React.FC<ScrutinLineProps> = ({
  children,
  scrutin
}) => {
  const translate = useTranslate()

  return (
    <ScrutinRegisterLine
      date={scrutin.date}
      href={scrutinPathFor(scrutin.number)}
      kind={scrutin.kind}
      outcome={scrutin.outcome}
      reference={translate('scrutin.reference', { number: scrutin.number })}
      title={scrutinTitleOf(scrutin.title)}
      totals={scrutin.totals}
    >
      {children}
    </ScrutinRegisterLine>
  )
}
