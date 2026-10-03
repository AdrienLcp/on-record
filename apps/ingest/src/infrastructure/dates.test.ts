import { describe, expect, it } from 'vitest'

import { toIsoString } from '@/infrastructure/dates.ts'

describe('toIsoString', () => {
  it('keeps a zero millisecond fraction', () => {
    expect(toIsoString(Temporal.Instant.from('2026-10-03T21:00:00Z'))).toBe(
      '2026-10-03T21:00:00.000Z'
    )
  })

  it('drops what is finer than a millisecond', () => {
    expect(
      toIsoString(Temporal.Instant.from('2026-10-03T21:00:00.123456Z'))
    ).toBe('2026-10-03T21:00:00.123Z')
  })
})
