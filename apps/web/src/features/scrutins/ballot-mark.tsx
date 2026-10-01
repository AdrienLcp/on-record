import type React from 'react'

import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'

import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './ballot-mark.sass'

/** The stroke drawn inside each disc: a position reads by its shape, colour only seconds it. */
const MARK_PATHS = {
  abstention: 'M6 10h8',
  against: 'M7 7l6 6M13 7l-6 6',
  for: 'M6 10.5l2.6 2.6L14 7.5',
  nonVoting: ''
} as const satisfies Record<BallotPosition, string>

type BallotMarkProps = {
  position: BallotPosition
  /**
   * Whether the position's name follows the mark (default: `true`). Without
   * it the mark still names the position to a screen reader.
   */
  withLabel?: boolean
}

export const BallotMark: React.FC<BallotMarkProps> = ({
  position,
  withLabel = true
}) => {
  const translate = useTranslate()
  const label = translate(`ballot.position.${position}`)

  return (
    <span className={`ballot-mark ${position}`}>
      <svg
        aria-hidden='true'
        className='ballot-disc'
        focusable='false'
        height='20'
        viewBox='0 0 20 20'
        width='20'
      >
        <circle className='disc' cx='10' cy='10' r='8.25' />
        {MARK_PATHS[position] !== '' && (
          <path className='stroke' d={MARK_PATHS[position]} />
        )}
      </svg>
      {withLabel ? (
        <span className='ballot-label'>{label}</span>
      ) : (
        <VisuallyHidden elementType='span'>{label}</VisuallyHidden>
      )}
    </span>
  )
}
