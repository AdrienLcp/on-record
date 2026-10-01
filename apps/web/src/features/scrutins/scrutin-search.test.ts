import { describe, expect, it } from 'vitest'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import {
  filterScrutins,
  latestMajorScrutins,
  parseKindFilter,
  parseOutcomeFilter
} from './scrutin-search'

const scrutin = (overrides: Partial<ScrutinSummary>): ScrutinSummary => ({
  date: '2025-01-01',
  kind: 'ordinary',
  legislativeFileId: null,
  number: 1,
  outcome: 'adopted',
  title: "l'amendement n° 1 à l'article 2 du projet de loi de finances.",
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 },
  ...overrides
})

const scrutins = [
  scrutin({ number: 1 }),
  scrutin({
    kind: 'solemn',
    number: 2,
    title: "l'ensemble du projet de loi relatif à l'énergie."
  }),
  scrutin({
    kind: 'censure',
    number: 3,
    outcome: 'rejected',
    title: 'la motion de censure.'
  }),
  scrutin({ number: 4, outcome: 'rejected' })
]

describe('filterScrutins', () => {
  it('[scrutins] combines kind, outcome and words of the title', () => {
    const found = filterScrutins({
      filters: { kind: 'ordinary', outcome: 'rejected', query: 'FINANCES' },
      scrutins
    })

    expect(found.map(({ number }) => number)).toEqual([4])
  })

  it('[scrutins] finds a title word typed without its accent', () => {
    const found = filterScrutins({
      filters: { kind: 'all', outcome: 'all', query: 'energie' },
      scrutins
    })

    expect(found.map(({ number }) => number)).toEqual([2])
  })
})

describe('latestMajorScrutins', () => {
  it('[scrutins] keeps solemn votes and motions of censure, newest first', () => {
    const latest = latestMajorScrutins({ count: 5, scrutins })

    expect(latest.map(({ number }) => number)).toEqual([3, 2])
  })
})

describe('filters read from the URL', () => {
  it('[scrutins] fall back to everything on a value they do not know', () => {
    expect(parseKindFilter('solemn')).toBe('solemn')
    expect(parseKindFilter('anything')).toBe('all')
    expect(parseOutcomeFilter(null)).toBe('all')
  })
})
