import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { RecordedBallot } from '@on-record/protocol/assembly/deputy-record'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import {
  agreementOf,
  deputyVoteLines,
  filterVoteLines,
  parseBallotFilter,
  participationOf
} from './deputy-votes'

const deputy: Deputy = {
  birthDate: null,
  constituency: 1,
  department: { code: '75', name: 'Paris' },
  firstName: 'Nathan',
  gender: 'male',
  groups: [
    { from: '2024-07-18', groupId: 'PO2', to: '2025-01-15' },
    { from: '2025-01-16', groupId: 'PO1', to: null }
  ],
  hatvpUrl: null,
  id: 'PA6',
  lastName: 'Richard',
  mandates: [{ from: '2024-07-18', to: '2025-06-30' }],
  profession: null
}

const scrutin = (
  number: number,
  date: string,
  kind: ScrutinSummary['kind'] = 'ordinary'
): ScrutinSummary => ({
  date,
  kind,
  legislativeFileId: null,
  number,
  outcome: 'adopted',
  title: 'un intitulé.',
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 }
})

const ballot = (
  overrides: Partial<RecordedBallot> & { scrutin: number }
): RecordedBallot => ({
  byDelegation: false,
  correction: null,
  groupPosition: 'for',
  position: 'for',
  ...overrides
})

const scrutins = [
  scrutin(1, '2024-10-02'),
  scrutin(2, '2024-12-04', 'solemn'),
  scrutin(3, '2025-02-11'),
  scrutin(4, '2025-04-08', 'censure'),
  scrutin(5, '2025-05-14'),
  // After the deputy left their seat: not theirs to vote on.
  scrutin(6, '2025-09-01')
]

const ballots = [
  ballot({ scrutin: 1 }),
  ballot({ correction: 'abstention', position: 'against', scrutin: 2 }),
  ballot({ groupPosition: null, position: 'against', scrutin: 3 }),
  ballot({
    byDelegation: true,
    groupPosition: 'for',
    position: 'nonVoting',
    scrutin: 5
  })
]

const lines = deputyVoteLines({ ballots, deputy, scrutins })

describe('deputyVoteLines', () => {
  it('[deputy-votes] lists every scrutin held while seated, newest first, missed ones included', () => {
    expect(
      lines.map((line) => [line.scrutin.number, line.ballot !== null])
    ).toEqual([
      [5, true],
      [4, false],
      [3, true],
      [2, true],
      [1, true]
    ])
  })

  it('[deputy-votes] files each vote under the group of its day', () => {
    expect(lines.map((line) => [line.scrutin.number, line.groupId])).toEqual([
      [5, 'PO1'],
      [4, 'PO1'],
      [3, 'PO1'],
      [2, 'PO2'],
      [1, 'PO2']
    ])
  })
})

describe('participationOf', () => {
  it('[deputy-votes] counts recorded votes, non-voting ones included, over the scrutins of the mandate', () => {
    expect(participationOf(lines)).toEqual({
      notRecorded: 1,
      recorded: 4,
      total: 5
    })
  })
})

describe('agreementOf', () => {
  it('[deputy-votes] compares only expressed votes where the group had a majority', () => {
    expect(agreementOf(lines)).toEqual({
      comparable: 2,
      differing: 1,
      matching: 1
    })
  })
})

describe('filterVoteLines', () => {
  it('[deputy-votes] lists exactly the lines each figure counts', () => {
    const numbersFor = (ballotFilter: string | null) =>
      filterVoteLines({
        filters: { ballot: parseBallotFilter(ballotFilter), kind: 'all' },
        lines
      }).map((line) => line.scrutin.number)

    expect(numbersFor('vote-enregistre')).toEqual([5, 4, 3, 2, 1])
    expect(numbersFor('recorded')).toEqual([5, 3, 2, 1])
    expect(numbersFor('notRecorded')).toEqual([4])
    expect(numbersFor('withGroup')).toEqual([1])
    expect(numbersFor('againstGroup')).toEqual([2])
    expect(numbersFor('corrected')).toEqual([2])
    expect(numbersFor('delegated')).toEqual([5])
  })

  it('[deputy-votes] narrows by kind of scrutin', () => {
    const solemn = filterVoteLines({
      filters: { ballot: 'all', kind: 'solemn' },
      lines
    })

    expect(solemn.map((line) => line.scrutin.number)).toEqual([2])
  })
})
