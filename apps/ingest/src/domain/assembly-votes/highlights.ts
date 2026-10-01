import {
  HIGHLIGHTED_CENSURE_MOTIONS,
  HIGHLIGHTED_SOLEMN_VOTES,
  type Highlights
} from '@on-record/protocol/assembly/highlights.ts'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin.ts'

/** The latest solemn votes and motions of censure, newest first. */
export const toHighlights = (
  scrutins: readonly ScrutinSummary[]
): Highlights => {
  const newestFirst = scrutins.toSorted(
    (left, right) => right.number - left.number
  )

  return {
    censureMotions: newestFirst
      .filter((scrutin) => scrutin.kind === 'censure')
      .slice(0, HIGHLIGHTED_CENSURE_MOTIONS),
    solemnVotes: newestFirst
      .filter((scrutin) => scrutin.kind === 'solemn')
      .slice(0, HIGHLIGHTED_SOLEMN_VOTES)
  }
}
