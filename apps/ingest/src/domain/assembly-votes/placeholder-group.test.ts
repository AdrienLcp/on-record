import { describe, expect, it } from 'vitest'

import type { GroupMembership } from '@on-record/protocol/assembly/deputy.ts'
import type {
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin.ts'

import {
  PLACEHOLDER_GROUP_ID,
  resolvePlaceholderGroups
} from '@/domain/assembly-votes/placeholder-group.ts'

const NATIONAL_RALLY = 'PO845401'
const NON_ATTACHED = 'PO840056'
const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const groupVote = (deputyIds: string[]): GroupVote => ({
  ballots: deputyIds.map((deputyId) => ({
    byDelegation: false,
    cause: null,
    deputyId,
    position: 'against'
  })),
  groupId: PLACEHOLDER_GROUP_ID,
  majorityPosition: deputyIds.length > 0 ? 'against' : null,
  memberCount: 9,
  totals: { ...noVotes, against: deputyIds.length }
})

const scrutinWith = (groups: GroupVote[]): ScrutinDetail => ({
  corrections: [],
  date: '2024-12-02',
  groups,
  kind: 'ordinary',
  legislativeFileId: null,
  number: 489,
  outcome: 'rejected',
  requester: null,
  title: 'A scrutin',
  totals: noVotes
})

const membershipsById = new Map<string, GroupMembership[]>([
  ['PA1', [{ from: '2024-07-19', groupId: NATIONAL_RALLY, to: null }]],
  ['PA2', [{ from: '2024-07-19', groupId: NATIONAL_RALLY, to: null }]],
  ['PA3', [{ from: '2024-07-08', groupId: NON_ATTACHED, to: null }]]
])

describe('resolvePlaceholderGroups', () => {
  it('[placeholder-group] gives a PO0 group the group all its voters belonged to that day', () => {
    const resolved = resolvePlaceholderGroups(
      scrutinWith([groupVote(['PA1', 'PA2'])]),
      membershipsById
    )

    expect(
      resolved.status === 'success' &&
        resolved.data.groups.map((group) => group.groupId)
    ).toEqual([NATIONAL_RALLY])
  })

  it('[placeholder-group] leaves out a PO0 group with no voter and no vote', () => {
    const resolved = resolvePlaceholderGroups(
      scrutinWith([groupVote(['PA1']), groupVote([])]),
      membershipsById
    )

    expect(resolved.status === 'success' && resolved.data.groups).toHaveLength(
      1
    )
  })

  it('[placeholder-group] refuses a PO0 group whose voters belonged to different groups', () => {
    expect(
      resolvePlaceholderGroups(
        scrutinWith([groupVote(['PA1', 'PA3'])]),
        membershipsById
      )
    ).toEqual({
      error: { code: 'unresolved_group', scrutin: 489 },
      status: 'failure'
    })
  })
})
