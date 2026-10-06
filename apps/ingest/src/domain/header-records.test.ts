import { describe, expect, it } from 'vitest'

import { recordsOf } from '@/domain/header-records.ts'

describe('recordsOf', () => {
  it('[header] keys each row by the header', () => {
    expect(
      recordsOf([
        ['COM', 'DEP'],
        ['2A004', '2A']
      ])
    ).toEqual([{ COM: '2A004', DEP: '2A' }])
  })
})
