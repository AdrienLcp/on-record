import { describe, expect, it } from 'vitest'

import {
  isGroupShownBy,
  parsePartyChoices,
  partyChoicesValue
} from './party-selection'

const RN_GROUP = 'PO845401'
const UDR_GROUP = 'PO872880'

describe('parsePartyChoices', () => {
  it('reads the URL tokens in chip order', () => {
    expect(parsePartyChoices('autres,lfi,rn')).toEqual(['rn', 'lfi', 'others'])
  })

  it('drops unknown tokens and duplicates', () => {
    expect(parsePartyChoices('lfi,ps,lfi,')).toEqual(['lfi'])
  })

  it('reads nothing from a missing parameter', () => {
    expect(parsePartyChoices(null)).toEqual([])
  })
})

describe('partyChoicesValue', () => {
  it('writes the choices back in chip order', () => {
    expect(partyChoicesValue(['others', 'placePublique', 'rn'])).toBe(
      'rn,place-publique,autres'
    )
  })

  it('removes the parameter when nothing is chosen', () => {
    expect(partyChoicesValue([])).toBeNull()
  })
})

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
