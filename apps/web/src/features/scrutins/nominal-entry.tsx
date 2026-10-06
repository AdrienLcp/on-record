import type React from 'react'

import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { BallotMark } from './ballot-mark'

import './nominal-entry.sass'

type NominalEntryProps = {
  byDelegation: boolean
  /** What the member declared afterwards, if they did. */
  correction: BallotPosition | null
  /** Their group on the day of the vote, as a label. */
  group: React.ReactNode
  /** The member's own page. */
  href: string
  name: string
  position: BallotPosition
}

/**
 * One member's line in a nominal list: name, group of the day, recorded vote,
 * and the "mise au point" beside it. Lay them out in a `.nominal-list` card.
 */
export const NominalEntry: React.FC<NominalEntryProps> = ({
  byDelegation,
  correction,
  group,
  href,
  name,
  position
}) => {
  const translate = useTranslate()

  return (
    <div className='nominal-entry'>
      <TextLink className='nominal-name' href={href}>
        {name}
      </TextLink>
      {group}
      <span className='nominal-ballot'>
        <BallotMark position={position} />
        {byDelegation && (
          <span className='nominal-aside'>
            {translate('ballot.byDelegation')}
          </span>
        )}
      </span>
      {correction !== null && (
        <span className='nominal-correction'>
          {translate('ballot.correction', { intended: correction })}
        </span>
      )}
    </div>
  )
}
