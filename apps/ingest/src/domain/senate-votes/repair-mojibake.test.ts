import { describe, expect, it } from 'vitest'

import { repairMojibake } from '@/domain/senate-votes/repair-mojibake.ts'

describe('repairMojibake', () => {
  it('[senate] turns the stored C1 controls back into Windows-1252 punctuation', () => {
    expect(repairMojibake('sur l\u0092ensemble \u0096 c\u009cur')).toBe(
      'sur l’ensemble – cœur'
    )
  })

  it('[senate] drops a C1 control Windows-1252 leaves undefined', () => {
    expect(repairMojibake('a\u0081b')).toBe('ab')
  })

  it('[senate] leaves clean text untouched', () => {
    expect(repairMojibake('Élisabeth Doineau')).toBe('Élisabeth Doineau')
  })
})
