import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

/** The tabs over a nominal list: every member, or those of one position. */
export type NominalPositionFilter = 'all' | BallotPosition

export const NOMINAL_POSITION_FILTERS = [
  'all',
  'for',
  'against',
  'abstention',
  'nonVoting'
] as const satisfies readonly NominalPositionFilter[]

export const isNominalPositionFilter = (
  key: unknown
): key is NominalPositionFilter =>
  NOMINAL_POSITION_FILTERS.some((filter) => filter === key)
