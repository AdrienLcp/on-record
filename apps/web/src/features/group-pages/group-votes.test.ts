import { describe, expect, it } from 'vitest'

import type { GroupScrutinVote } from '@on-record/protocol/assembly/group-record'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import {
  censureSupportOf,
  filterGroupLines,
  groupKindSearchValue,
  groupVoteLines,
  parseGroupKindFilter,
  solemnPositionCountsOf,
  withoutVoteCountOf
} from './group-votes'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const scrutin = (
  number: number,
  kind: ScrutinSummary['kind'] = 'ordinary'
): ScrutinSummary => ({
  date: '2025-03-01',
  kind,
  legislativeFileId: null,
  number,
  outcome: 'adopted',
  title: 'un intitulé.',
  totals: noVotes
})

const vote = (
  number: number,
  overrides: Partial<GroupScrutinVote> = {}
): GroupScrutinVote => ({
  memberCount: 10,
  position: 'for',
  scrutin: number,
  totals: { ...noVotes, for: 8 },
  ...overrides
})

describe('groupVoteLines', () => {
  it('[group-votes] joins each vote with its scrutin, newest first, and skips a scrutin the index lacks', () => {
    const lines = groupVoteLines({
      scrutins: [scrutin(3), scrutin(9)],
      votes: [vote(3), vote(9), vote(12)]
    })

    expect(lines.map((line) => line.scrutin.number)).toEqual([9, 3])
  })
})

describe('parseGroupKindFilter', () => {
  it('[group-votes] opens on solemn votes, and keeps "all" when asked for', () => {
    expect(parseGroupKindFilter(null)).toBe('solemn')
    expect(parseGroupKindFilter('all')).toBe('all')
    expect(groupKindSearchValue('solemn')).toBeUndefined()
    expect(groupKindSearchValue('all')).toBe('all')
  })
})

describe('filterGroupLines', () => {
  it('[group-votes] filters by kind and by published position, "none" standing for no position', () => {
    const lines = groupVoteLines({
      scrutins: [scrutin(1, 'solemn'), scrutin(2, 'solemn'), scrutin(3)],
      votes: [vote(1), vote(2, { position: null }), vote(3)]
    })

    expect(
      filterGroupLines({
        filters: { kind: 'solemn', position: 'none' },
        lines
      }).map((line) => line.scrutin.number)
    ).toEqual([2])
    expect(
      filterGroupLines({
        filters: { kind: 'all', position: 'for' },
        lines
      }).map((line) => line.scrutin.number)
    ).toEqual([3, 1])
  })
})

describe('withoutVoteCountOf', () => {
  it('[group-votes] counts members with no recorded vote, non-voting ones excluded', () => {
    expect(
      withoutVoteCountOf(
        vote(1, { totals: { abstention: 1, against: 2, for: 3, nonVoting: 1 } })
      )
    ).toBe(3)
  })
})

describe('solemnPositionCountsOf', () => {
  it('[group-votes] counts solemn votes per published position only', () => {
    const lines = groupVoteLines({
      scrutins: [scrutin(1, 'solemn'), scrutin(2, 'solemn'), scrutin(3)],
      votes: [vote(1), vote(2, { position: 'against' }), vote(3)]
    })

    expect(solemnPositionCountsOf(lines)).toEqual({
      byPosition: { abstention: 0, against: 1, for: 1, none: 0, nonVoting: 0 },
      total: 2
    })
  })
})

describe('censureSupportOf', () => {
  it('[group-votes] counts the motions more than half of the members voted', () => {
    const lines = groupVoteLines({
      scrutins: [scrutin(1, 'censure'), scrutin(2, 'censure'), scrutin(3)],
      votes: [
        vote(1, { totals: { ...noVotes, for: 6 } }),
        vote(2, { totals: { ...noVotes, for: 5 } }),
        vote(3)
      ]
    })

    expect(censureSupportOf(lines)).toEqual({
      backedByMostMembers: 1,
      motions: 2
    })
  })
})
