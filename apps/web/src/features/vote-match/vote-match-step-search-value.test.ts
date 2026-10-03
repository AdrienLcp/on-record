import { describe, expect, it } from 'vitest'

import { parseStep, stepSearchValue } from './vote-match-step-search-value'

describe('parseStep', () => {
  it('reads a question by its position, starting at 1', () => {
    expect(parseStep({ questionCount: 12, value: '3' })).toEqual({
      index: 2,
      kind: 'question'
    })
  })

  it('reads the result, and the start for anything out of range', () => {
    expect(parseStep({ questionCount: 12, value: 'resultat' })).toEqual({
      kind: 'result'
    })
    expect(parseStep({ questionCount: 12, value: '13' }).kind).toBe('intro')
    expect(parseStep({ questionCount: 12, value: '0' }).kind).toBe('intro')
    expect(parseStep({ questionCount: 12, value: null }).kind).toBe('intro')
  })

  it('writes back the position it read', () => {
    expect(stepSearchValue({ index: 2, kind: 'question' })).toBe('3')
    expect(stepSearchValue({ kind: 'intro' })).toBeUndefined()
  })
})
