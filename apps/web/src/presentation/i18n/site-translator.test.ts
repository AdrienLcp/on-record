import { describe, expect, it } from 'vitest'

import { dateOfDay, dateOfTimestamp } from '@/infrastructure/dates'

import { translate } from './site-translator'

describe('translate', () => {
  it('writes the first of a month as an ordinal', () => {
    expect(translate('common.day', { day: dateOfDay('2026-10-01') })).toBe(
      '1er octobre 2026'
    )
    expect(
      translate('common.shortDay', { day: dateOfDay('2026-02-01') })
    ).toMatch(/^1er\sfévr\. 2026$/u)
  })

  it('leaves other days as Intl prints them', () => {
    expect(translate('common.day', { day: dateOfDay('2026-10-11') })).toBe(
      '11 octobre 2026'
    )
    expect(translate('common.day', { day: dateOfDay('2026-10-21') })).toBe(
      '21 octobre 2026'
    )
  })

  it('applies to the plain parts of a rich message', () => {
    const pieces = translate.rich('method.generatedAt', {
      day: dateOfTimestamp('2026-05-01T08:00:00Z')
    })

    expect(pieces.join('')).toMatch(
      /^Dernière génération des données : 1er mai 2026/u
    )
  })
})
