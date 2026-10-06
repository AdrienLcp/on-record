import type React from 'react'

import type { VoteTotals } from '@on-record/protocol/votes/vote-totals'

import './vote-bar.sass'

/**
 * Diverging order: for on the left, against on the right, abstention as the
 * grey middle between them.
 */
const SEGMENTS = ['for', 'abstention', 'against'] as const

type VoteBarProps = {
  /**
   * What the full length stands for: a group's members, so the empty end of
   * the track is those without a recorded vote; or the votes cast.
   */
  base: number
  totals: VoteTotals
}

/** The counts drawn as one bar; always printed beside it, so it is hidden from screen readers. */
export const VoteBar: React.FC<VoteBarProps> = ({ base, totals }) => (
  <div aria-hidden='true' className='vote-bar'>
    {base > 0 &&
      SEGMENTS.filter((position) => totals[position] > 0).map((position) => (
        <span
          className={`vote-segment ${position}`}
          key={position}
          style={{ '--share': totals[position] / base }}
        />
      ))}
  </div>
)
