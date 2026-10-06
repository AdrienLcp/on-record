import { describe, expect, it } from 'vitest'

import type { Ballot, GroupVote } from '@on-record/protocol/assembly/scrutin'

import { dissentersOf, withoutVoteCountOf } from './group-vote-breakdown'

const ballot = (deputyId: string, position: Ballot['position']): Ballot => ({
  byDelegation: false,
  cause: null,
  deputyId,
  position
})

const groupVote = (overrides: Partial<GroupVote>): GroupVote => ({
  ballots: [],
  groupId: 'PO1',
  majorityPosition: 'for',
  memberCount: 10,
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 },
  ...overrides
})

describe('dissentersOf', () => {
  it('[breakdown] lists members who voted otherwise, but not the non-voting', () => {
    const dissenters = dissentersOf(
      groupVote({
        ballots: [
          ballot('PA1', 'for'),
          ballot('PA2', 'against'),
          ballot('PA3', 'abstention'),
          ballot('PA4', 'nonVoting')
        ]
      })
    )

    expect(dissenters.map(({ deputyId }) => deputyId)).toEqual(['PA2', 'PA3'])
  })

  it('[breakdown] finds no dissent in a group with no majority', () => {
    const dissenters = dissentersOf(
      groupVote({
        ballots: [ballot('PA1', 'for'), ballot('PA2', 'against')],
        majorityPosition: null
      })
    )

    expect(dissenters).toEqual([])
  })
})

describe('withoutVoteCountOf', () => {
  it('[breakdown] counts members with no recorded vote', () => {
    expect(
      withoutVoteCountOf(
        groupVote({ ballots: [ballot('PA1', 'for')], memberCount: 4 })
      )
    ).toBe(3)
  })
})
