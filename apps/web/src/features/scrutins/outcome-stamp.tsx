import type React from 'react'

import type { AmendmentOutcome } from '@on-record/protocol/assembly/amendment'
import type { ScrutinOutcome } from '@on-record/protocol/votes/scrutin-outcome'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './outcome-stamp.sass'

type OutcomeStampProps = {
  outcome: AmendmentOutcome | ScrutinOutcome
  /** The stamp's size (default: `'small'`). */
  size?: 'large' | 'small'
}

/**
 * The outcome as a filing stamp: filled when adopted, outlined when rejected,
 * dashed when an amendment was set aside without a vote. None is green or red;
 * the word carries the meaning.
 */
export const OutcomeStamp: React.FC<OutcomeStampProps> = ({
  outcome,
  size = 'small'
}) => {
  const translate = useTranslate()

  return (
    <span className={`outcome-stamp ${outcome} ${size}`}>
      {translate(`outcome.${outcome}`)}
    </span>
  )
}
