import { describe, expect, it } from 'vitest'

import {
  type CurrentCommune,
  placeCommunes,
  type TableCommune
} from '@/domain/constituencies/commune-placement.ts'

/** Real cases of the 2017 table against the 2026 map, trimmed to what each rule needs. */
const tableCommunes: TableCommune[] = [
  { code: '01001', constituencies: [1], department: '01' },
  // Béon and Culoz, merged into Culoz-Béon (01138) on 2023-01-01.
  { code: '01039', constituencies: [3], department: '01' },
  { code: '01138', constituencies: [5], department: '01' },
  // Saline (14712), which Sannerville left again on 2019-12-31.
  { code: '14712', constituencies: [4], department: '14' },
  // Belleville-sur-Meuse, in the canton of Beaumont-en-Verdunois.
  { code: '55040', constituencies: [1], department: '55' },
  { code: '55029', constituencies: [2], department: '55' },
  // Paris, one commune over eighteen constituencies.
  { code: '75056', constituencies: [1, 2, 3], department: '75' },
  // Wallis-et-Futuna as one line, where INSEE lists three kingdoms.
  { code: '98601', constituencies: [1], department: '986' }
]

const currentCommunes: CurrentCommune[] = [
  { canton: '0108', code: '01001', department: '01' },
  { canton: '0104', code: '01138', department: '01' },
  { canton: '1418', code: '14666', department: '14' },
  { canton: '1418', code: '14712', department: '14' },
  { canton: '5504', code: '55039', department: '55' },
  { canton: '5504', code: '55040', department: '55' },
  { canton: '5502', code: '55029', department: '55' },
  { canton: '7599', code: '75056', department: '75' },
  { canton: null, code: '98611', department: '986' },
  { canton: '9999', code: '99999', department: '99' }
]

const { placements, report } = placeCommunes({
  currentCommunes,
  moves: [
    { from: '01039', to: '01138' },
    { from: '14666', to: '14712' },
    { from: '14712', to: '14666' }
  ],
  tableCommunes
})

describe('placeCommunes', () => {
  it('[communes] places a commune the table lists under its current code', () => {
    expect(placements.get('01001')).toEqual({
      constituencies: [1],
      department: '01'
    })
  })

  it('[communes] keeps both constituencies of communes merged across a boundary', () => {
    expect(placements.get('01138')?.constituencies).toEqual([3, 5])
  })

  it('[communes] keeps every constituency of a split city', () => {
    expect(placements.get('75056')?.constituencies).toEqual([1, 2, 3])
  })

  it('[communes] places a restored commune like the merger it left', () => {
    expect(placements.get('14666')).toEqual({
      constituencies: [4],
      department: '14'
    })
  })

  it('[communes] places a commune of a one-constituency territory the table names otherwise', () => {
    expect(placements.get('98611')).toEqual({
      constituencies: [1],
      department: '986'
    })
    expect(report.unmatchedTableCommunes).toEqual(['98601'])
  })

  it('[communes] places a commune missing from the table like the rest of its canton', () => {
    expect(placements.get('55039')).toEqual({
      constituencies: [1],
      department: '55'
    })
  })

  it('[communes] reports a commune no rule can place, and counts each rule', () => {
    expect(report.unplacedCommunes).toEqual(['99999'])
    expect(report.placedBy).toEqual({
      canton: 1,
      restored: 1,
      singleConstituency: 1,
      table: 6
    })
  })
})
