import { describe, expect, it } from 'vitest'

import type {
  Ballot,
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'

import {
  countedVotesOf,
  digestOf,
  groupStanceSectionsOf,
  groupsByCensureVotes
} from './group-stances'

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

const scrutin = (overrides: Partial<ScrutinDetail>): ScrutinDetail => ({
  corrections: [],
  date: '2026-07-21',
  groups: [],
  kind: 'ordinary',
  legislativeFileId: null,
  number: 1,
  outcome: 'adopted',
  requester: null,
  title: 'Un scrutin',
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 },
  ...overrides
})

describe('groupStanceSectionsOf', () => {
  it('[stances] files groups for, abstention, against, then without position, largest first', () => {
    const sections = groupStanceSectionsOf([
      groupVote({ groupId: 'PO-small-for', memberCount: 5 }),
      groupVote({ groupId: 'PO-against', majorityPosition: 'against' }),
      groupVote({ groupId: 'PO-none', majorityPosition: null }),
      groupVote({ groupId: 'PO-big-for', memberCount: 90 }),
      groupVote({ groupId: 'PO-abstention', majorityPosition: 'abstention' })
    ])

    expect(
      sections.map(({ groups, stance }) => [
        stance,
        groups.map(({ groupId }) => groupId)
      ])
    ).toEqual([
      ['for', ['PO-big-for', 'PO-small-for']],
      ['abstention', ['PO-abstention']],
      ['against', ['PO-against']],
      ['none', ['PO-none']]
    ])
  })
})

describe('countedVotesOf', () => {
  const totals = { abstention: 2, against: 3, for: 5, nonVoting: 1 }

  it('[stances] counts the members who voted the group position', () => {
    expect(
      countedVotesOf(groupVote({ majorityPosition: 'against', totals }))
    ).toBe(3)
  })

  it('[stances] counts every vote cast when the group published no position', () => {
    expect(countedVotesOf(groupVote({ majorityPosition: null, totals }))).toBe(
      10
    )
  })
})

describe('groupsByCensureVotes', () => {
  it('[stances] orders groups by votes for the censure', () => {
    const groups = groupsByCensureVotes([
      groupVote({
        groupId: 'PO-few',
        memberCount: 90,
        totals: { abstention: 0, against: 0, for: 1, nonVoting: 0 }
      }),
      groupVote({
        groupId: 'PO-many',
        memberCount: 70,
        totals: { abstention: 0, against: 0, for: 68, nonVoting: 0 }
      })
    ])

    expect(groups.map(({ groupId }) => groupId)).toEqual(['PO-many', 'PO-few'])
  })
})

describe('digestOf', () => {
  it('[stances] counts groups per position and members who broke from theirs', () => {
    const digest = digestOf(
      scrutin({
        groups: [
          groupVote({
            ballots: [ballot('PA1', 'for'), ballot('PA2', 'against')]
          }),
          groupVote({ majorityPosition: 'for' }),
          groupVote({
            ballots: [ballot('PA3', 'abstention'), ballot('PA4', 'nonVoting')],
            majorityPosition: 'against'
          }),
          groupVote({ majorityPosition: null })
        ]
      })
    )

    expect(digest).toEqual({
      dissenterCount: 2,
      groupCountByStance: {
        abstention: 0,
        against: 1,
        for: 2,
        none: 1,
        nonVoting: 0
      },
      kind: 'vote'
    })
  })

  it('[stances] counts only the groups with a vote for a censure motion', () => {
    const digest = digestOf(
      scrutin({
        groups: [
          groupVote({
            totals: { abstention: 0, against: 0, for: 3, nonVoting: 0 }
          }),
          groupVote({})
        ],
        kind: 'censure'
      })
    )

    expect(digest).toEqual({ censureGroupCount: 1, kind: 'censure' })
  })
})
