import { describe, expect, it } from 'vitest'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin.ts'
import type { ScrutinKind } from '@on-record/protocol/votes/scrutin-kind.ts'

import { toHighlights } from '@/domain/assembly-votes/highlights.ts'

const scrutinOf = (number: number, kind: ScrutinKind): ScrutinSummary => ({
  date: '2026-03-26',
  kind,
  legislativeFileId: null,
  number,
  outcome: 'rejected',
  title: `Scrutin ${number}`,
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 }
})

const numbersOf = (scrutins: readonly ScrutinSummary[]) =>
  scrutins.map((scrutin) => scrutin.number)

describe('toHighlights', () => {
  const solemnVotes = Array.from({ length: 12 }, (_, index) =>
    scrutinOf(100 + index, 'solemn')
  )
  const censureMotions = Array.from({ length: 7 }, (_, index) =>
    scrutinOf(200 + index, 'censure')
  )
  const highlights = toHighlights([
    ...censureMotions,
    scrutinOf(999, 'ordinary'),
    ...solemnVotes
  ])

  it('[highlights] keeps the ten latest solemn votes, newest first', () => {
    expect(numbersOf(highlights.solemnVotes)).toEqual([
      111, 110, 109, 108, 107, 106, 105, 104, 103, 102
    ])
  })

  it('[highlights] keeps the five latest motions of censure, newest first', () => {
    expect(numbersOf(highlights.censureMotions)).toEqual([
      206, 205, 204, 203, 202
    ])
  })

  it('[highlights] leaves ordinary votes out', () => {
    expect(
      [...highlights.solemnVotes, ...highlights.censureMotions].some(
        (scrutin) => scrutin.kind === 'ordinary'
      )
    ).toBe(false)
  })
})
