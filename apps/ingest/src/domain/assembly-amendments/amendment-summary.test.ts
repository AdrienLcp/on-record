import { describe, expect, it } from 'vitest'

import {
  SUMMARY_MAX_LENGTH,
  toAmendmentSummary
} from '@/domain/assembly-amendments/amendment-summary.ts'

describe('toAmendmentSummary', () => {
  it('[entities] strips the markup and decodes every kind of entity', () => {
    expect(
      toAmendmentSummary(
        '<p style="text-align: justify;">Le droit d&#x2019;&#x00E9;ligibilit&#233;&nbsp;:</p><p>&laquo;&nbsp;locales&nbsp;&raquo; &amp; plus</p>'
      )
    ).toBe('Le droit d’éligibilité : « locales » & plus')
  })

  it('[cut] cuts a long summary on a word boundary', () => {
    const words = 'amendement '.repeat(40)
    const summary = toAmendmentSummary(`<p>${words}</p>`)

    expect(summary?.endsWith('amendement…')).toBe(true)
    expect(summary?.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH + 1)
  })

  it('[none] gives nothing for an absent or empty summary', () => {
    expect(toAmendmentSummary(null)).toBeNull()
    expect(toAmendmentSummary('<p>&nbsp;</p>')).toBeNull()
  })
})
