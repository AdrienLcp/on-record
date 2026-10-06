import { describe, expect, it } from 'vitest'

import type { SenateScrutinSummary } from '@on-record/protocol/senate/senate-scrutin'
import type { Senator } from '@on-record/protocol/senate/senator'
import type { SenatorBallot } from '@on-record/protocol/senate/senator-record'

import {
  filterSenatorVoteLines,
  parseSenatorBallotFilter,
  senatorVoteLines
} from './senator-votes'

const senator: Senator = {
  birthDate: null,
  constituency: { code: '75', name: 'Paris' },
  firstName: 'Claire',
  gender: 'female',
  groups: [
    { from: '2023-10-02', groupId: 'SOC', to: '2025-01-15' },
    { from: '2025-01-16', groupId: 'UC', to: null }
  ],
  hatvpUrl: null,
  id: '12345A',
  lastName: 'Martin',
  mandates: [{ from: '2023-10-02', to: null }],
  profession: null
}

const scrutin = (
  id: string,
  date: string,
  kind: SenateScrutinSummary['kind'] = 'ordinary'
): SenateScrutinSummary => ({
  date,
  id,
  kind,
  legislativeFile: null,
  number: Number(id.split('-')[1]),
  outcome: 'adopted',
  session: Number(id.split('-')[0]),
  title: `sur l'article ${id}`,
  totals: { abstention: 0, against: 10, for: 20, nonVoting: 0 }
})

const ballot = (
  scrutinId: string,
  overrides: Partial<SenatorBallot> = {}
): SenatorBallot => ({
  byDelegation: false,
  correction: null,
  groupPosition: 'for',
  position: 'for',
  scrutin: scrutinId,
  ...overrides
})

const scrutins = [
  scrutin('2025-3', '2025-11-04', 'solemn'),
  scrutin('2024-8', '2024-12-10'),
  scrutin('2024-2', '2024-10-15')
]

describe('senatorVoteLines', () => {
  it('joins each ballot with its scrutin and the group of that day', () => {
    const lines = senatorVoteLines({
      ballots: [ballot('2025-3'), ballot('2024-8')],
      scrutins,
      senator
    })

    expect(lines.map(({ groupId, scrutin }) => [scrutin.id, groupId])).toEqual([
      ['2025-3', 'UC'],
      ['2024-8', 'SOC']
    ])
  })

  it('leaves out a ballot on a scrutin missing from the index', () => {
    expect(
      senatorVoteLines({ ballots: [ballot('2025-130')], scrutins, senator })
    ).toEqual([])
  })
})

describe('filterSenatorVoteLines', () => {
  const lines = senatorVoteLines({
    ballots: [
      ballot('2025-3', { byDelegation: true }),
      ballot('2024-8', { correction: 'against', position: 'against' }),
      ballot('2024-2', { groupPosition: null })
    ],
    scrutins,
    senator
  })
  const shown = (ballotFilter: string, kind: 'all' | 'solemn' = 'all') =>
    filterSenatorVoteLines({
      filters: { ballot: parseSenatorBallotFilter(ballotFilter), kind },
      lines
    }).map(({ scrutin }) => scrutin.id)

  it('sets a ballot against the group only when the group had a majority', () => {
    expect(shown('withGroup')).toEqual(['2025-3'])
    expect(shown('againstGroup')).toEqual(['2024-8'])
  })

  it('finds corrections, delegated ballots and a kind of scrutin', () => {
    expect(shown('corrected')).toEqual(['2024-8'])
    expect(shown('delegated')).toEqual(['2025-3'])
    expect(shown('all', 'solemn')).toEqual(['2025-3'])
  })

  it('reads an unknown filter as every line', () => {
    expect(shown('notRecorded')).toHaveLength(3)
  })
})
