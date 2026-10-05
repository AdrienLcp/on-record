import { describe, expect, it } from 'vitest'

import { toAmendmentOutcome } from '@/domain/assembly-amendments/amendment-outcome.ts'

describe('toAmendmentOutcome', () => {
  it('[sort] reads the outcome from the sort once the turn came', () => {
    expect(toAmendmentOutcome({ sort: 'Adopté', stateCode: 'DI' })).toBe(
      'adopted'
    )
    expect(toAmendmentOutcome({ sort: 'Non soutenu', stateCode: 'DI' })).toBe(
      'notMoved'
    )
    expect(toAmendmentOutcome({ sort: 'Tombé', stateCode: 'DI' })).toBe('fell')
  })

  it('[withdrawn] tells a withdrawal before the turn from the state', () => {
    expect(toAmendmentOutcome({ sort: null, stateCode: 'RT' })).toBe(
      'withdrawn'
    )
  })

  it('[inadmissible] groups every inadmissibility state', () => {
    for (const stateCode of ['IR', 'IRR45', 'IRRSA']) {
      expect(toAmendmentOutcome({ sort: null, stateCode })).toBe('inadmissible')
    }
  })

  it('[pending] leaves an amendment waiting or in processing pending', () => {
    expect(toAmendmentOutcome({ sort: null, stateCode: 'AC' })).toBe('pending')
    expect(toAmendmentOutcome({ sort: '', stateCode: 'ET' })).toBe('pending')
  })
})
