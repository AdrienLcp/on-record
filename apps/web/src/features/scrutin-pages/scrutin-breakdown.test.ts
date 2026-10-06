import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type {
  Ballot,
  GroupVote,
  ScrutinDetail
} from '@on-record/protocol/assembly/scrutin'

import { filterNominalLines, nominalLinesOf } from './scrutin-breakdown'

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

const person = (id: string, firstName: string, lastName: string): Deputy => ({
  birthDate: null,
  constituency: 1,
  department: { code: '75', name: 'Paris' },
  firstName,
  gender: 'female',
  groups: [],
  hatvpUrl: null,
  id,
  lastName,
  mandates: [{ from: '2024-07-18', to: null }],
  profession: null
})

const scrutin: ScrutinDetail = {
  corrections: [{ deputyId: 'PA2', intended: 'abstention' }],
  date: '2025-01-01',
  groups: [
    groupVote({
      ballots: [ballot('PA1', 'for'), ballot('PA2', 'against')],
      groupId: 'PO1'
    }),
    groupVote({ ballots: [ballot('PA3', 'against')], groupId: 'PO2' })
  ],
  kind: 'solemn',
  legislativeFileId: null,
  number: 12,
  outcome: 'rejected',
  requester: null,
  title: "l'ensemble du projet de loi.",
  totals: { abstention: 0, against: 2, for: 1, nonVoting: 0 }
}

const deputiesById = new Map([
  ['PA1', person('PA1', 'Zoé', 'Laurent')],
  ['PA2', person('PA2', 'Jules', 'Lefèvre')],
  ['PA3', person('PA3', 'Camille', 'Durand')]
])

describe('nominalLinesOf', () => {
  it('[breakdown] lists every ballot by last name, with its group and correction', () => {
    const lines = nominalLinesOf({ deputiesById, scrutin })

    expect(
      lines.map((line) => [
        line.deputy?.lastName,
        line.groupId,
        line.correction
      ])
    ).toEqual([
      ['Durand', 'PO2', null],
      ['Laurent', 'PO1', null],
      ['Lefèvre', 'PO1', 'abstention']
    ])
  })
})

describe('filterNominalLines', () => {
  it('[breakdown] combines a name search with a position', () => {
    const lines = nominalLinesOf({ deputiesById, scrutin })
    const found = filterNominalLines({
      lines,
      position: 'against',
      query: 'lefevre'
    })

    expect(found.map((line) => line.ballot.deputyId)).toEqual(['PA2'])
  })
})
