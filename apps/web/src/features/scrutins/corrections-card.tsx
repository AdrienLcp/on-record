import type React from 'react'

import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './corrections-card.sass'

/** A member's "mise au point" on one scrutin. */
export type CorrectionLine = {
  href: string
  id: string
  intended: BallotPosition
  name: string
  /** `null` when no ballot of theirs is in the record. */
  recorded: BallotPosition | null
}

type CorrectionsCardProps = {
  /** Who declared them: deputies or senators. */
  lead: string
  lines: readonly CorrectionLine[]
}

/** The votes members declared afterwards, beside the one recorded. */
export const CorrectionsCard: React.FC<CorrectionsCardProps> = ({
  lead,
  lines
}) => {
  const translate = useTranslate()

  return (
    <RecordCard
      className='corrections'
      heading={translate('scrutin.corrections.title')}
    >
      <p className='record-note'>{lead}</p>
      <ul className='ruled-list'>
        {lines.map((line) => (
          <li className='correction-entry' key={line.id}>
            <TextLink href={line.href}>{line.name}</TextLink>
            <span className='correction-detail'>
              {line.recorded !== null &&
                `${translate('scrutin.corrections.recorded', { recorded: line.recorded })} · `}
              {translate('scrutin.corrections.intended', {
                intended: line.intended
              })}
            </span>
          </li>
        ))}
      </ul>
    </RecordCard>
  )
}
