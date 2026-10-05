import { describe, expect, it } from 'vitest'

import { officialAmendmentPath } from '@/domain/assembly-amendments/official-amendment-path.ts'

describe('officialAmendmentPath', () => {
  it('[committee] keeps the committee prefix of the number', () => {
    expect(
      officialAmendmentPath({
        number: 'AS2',
        organ: 'CION-SOC',
        uid: 'AMANR5L17PO420120B2851P0D1N000002'
      })
    ).toBe('2851/CION-SOC/AS2')
  })

  it('[budget part] moves the part from the number to the text', () => {
    expect(
      officialAmendmentPath({
        number: 'I-2194',
        organ: 'AN',
        uid: 'AMANR5L17PO838901B1906P1D1N002194'
      })
    ).toBe('1906A/AN/2194')
    expect(
      officialAmendmentPath({
        number: 'II-CF615',
        organ: 'CION_FIN',
        uid: 'AMANR5L17PO59048B1906P2D1N000615'
      })
    ).toBe('1906C/CION_FIN/CF615')
  })

  it('[rectified] drops the rectification', () => {
    expect(
      officialAmendmentPath({
        number: '12 (2ème Rect)',
        organ: 'AN',
        uid: 'AMANR5L17PO838901BTC1191P0D1N000012'
      })
    ).toBe('1191/AN/12')
  })

  it('[no text] builds nothing from a uid without a text number', () => {
    expect(
      officialAmendmentPath({ number: '1', organ: 'AN', uid: 'AMANR5L17X' })
    ).toBeNull()
  })
})
