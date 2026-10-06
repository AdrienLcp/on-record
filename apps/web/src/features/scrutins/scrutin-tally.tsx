import type React from 'react'

import type { ScrutinKind } from '@on-record/protocol/votes/scrutin-kind'
import type { VoteTotals } from '@on-record/protocol/votes/vote-totals'

import { BallotMark } from './ballot-mark'
import { VoteBar } from './vote-bar'

import './scrutin-tally.sass'

const TALLY_POSITIONS = ['for', 'against', 'abstention', 'nonVoting'] as const

type ScrutinTallyProps = {
  kind: ScrutinKind
  totals: VoteTotals
}

/**
 * The official totals by position, then their bar measured against the votes
 * cast. A motion of censure records votes for alone, so it shows only those.
 */
export const ScrutinTally: React.FC<ScrutinTallyProps> = ({ kind, totals }) => (
  <>
    <dl className='tally'>
      {TALLY_POSITIONS.filter(
        (position) => kind !== 'censure' || position === 'for'
      ).map((position) => (
        <div className='tally-entry' key={position}>
          <dt>
            <BallotMark position={position} />
          </dt>
          <dd className='tally-count'>{totals[position]}</dd>
        </div>
      ))}
    </dl>
    {kind !== 'censure' && (
      <VoteBar
        base={totals.for + totals.against + totals.abstention}
        totals={totals}
      />
    )}
  </>
)
