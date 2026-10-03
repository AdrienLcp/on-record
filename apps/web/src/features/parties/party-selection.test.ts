import { describe, expect, it } from 'vitest'

import { isGroupShownBy } from './party-selection'

const RN_GROUP = 'PO845401'
const UDR_GROUP = 'PO872880'

describe('isGroupShownBy', () => {
  it('shows every group when nothing is chosen', () => {
    expect(isGroupShownBy({ choices: [], groupId: UDR_GROUP })).toBe(true)
  })

  it('shows a race group only when its party is chosen', () => {
    expect(isGroupShownBy({ choices: ['rn'], groupId: RN_GROUP })).toBe(true)
    expect(isGroupShownBy({ choices: ['lfi'], groupId: RN_GROUP })).toBe(false)
  })

  it('files an allied group and a deputy without group under the others', () => {
    expect(isGroupShownBy({ choices: ['rn'], groupId: UDR_GROUP })).toBe(false)
    expect(isGroupShownBy({ choices: ['others'], groupId: UDR_GROUP })).toBe(
      true
    )
    expect(isGroupShownBy({ choices: ['others'], groupId: null })).toBe(true)
  })
})
