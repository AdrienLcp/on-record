import { describe, expect, it } from 'vitest'

import type { TabledAmendment } from '@on-record/protocol/assembly/amendment'

import {
  type AmendmentLine,
  amendmentLinesOf,
  filterAmendmentLines,
  outcomeCountsOf,
  parseOutcomeFilter,
  parseStageFilter
} from './amendment-search'

const amendment = (fields: Partial<TabledAmendment>): TabledAmendment => ({
  article: 'ART. 1',
  asRapporteur: false,
  date: '2025-01-01',
  legislativeFileId: 'DLR1',
  number: '1',
  officialPath: '1/AN/1',
  organ: 'AN',
  outcome: 'rejected',
  scrutin: null,
  summary: null,
  ...fields
})

const line = (fields: Partial<TabledAmendment>): AmendmentLine => ({
  ...amendment(fields),
  fileTitle: null
})

describe('amendmentLinesOf', () => {
  it('names the text of each amendment, when the file is known', () => {
    const lines = amendmentLinesOf({
      amendments: [
        amendment({ legislativeFileId: 'DLR1' }),
        amendment({ legislativeFileId: 'DLR2' }),
        amendment({ legislativeFileId: null })
      ],
      fileTitles: [{ id: 'DLR1', title: 'Loi de finances pour 2026' }]
    })

    expect(lines.map(({ fileTitle }) => fileTitle)).toEqual([
      'Loi de finances pour 2026',
      null,
      null
    ])
  })
})

describe('filters', () => {
  const lines = [
    line({ number: '1', organ: 'AN', outcome: 'adopted' }),
    line({ number: '2', organ: 'AN', outcome: 'rejected' }),
    line({ number: 'CF3', organ: 'CION_FIN', outcome: 'adopted' }),
    line({ number: 'AS4', organ: 'CION-SOC', outcome: 'inadmissible' })
  ]

  it('reads an unknown filter value as every line', () => {
    expect(parseStageFilter('nowhere')).toBe('all')
    expect(parseOutcomeFilter(null)).toBe('all')
    expect(parseOutcomeFilter('fell')).toBe('fell')
  })

  it('keeps the lines of the stage and the outcome asked for', () => {
    const numbersOf = (filters: Parameters<typeof filterAmendmentLines>[0]) =>
      filterAmendmentLines(filters).map(({ number }) => number)

    expect(
      numbersOf({ filters: { outcome: 'adopted', stage: 'all' }, lines })
    ).toEqual(['1', 'CF3'])
    expect(
      numbersOf({ filters: { outcome: 'all', stage: 'committee' }, lines })
    ).toEqual(['CF3', 'AS4'])
    expect(
      numbersOf({ filters: { outcome: 'adopted', stage: 'sitting' }, lines })
    ).toEqual(['1'])
  })

  it('counts each outcome at the stage shown', () => {
    expect(outcomeCountsOf({ lines, stage: 'committee' })).toEqual([
      { count: 2, outcome: 'all' },
      { count: 1, outcome: 'adopted' },
      { count: 0, outcome: 'rejected' },
      { count: 0, outcome: 'withdrawn' },
      { count: 0, outcome: 'fell' },
      { count: 0, outcome: 'notMoved' },
      { count: 1, outcome: 'inadmissible' },
      { count: 0, outcome: 'pending' }
    ])
  })
})
