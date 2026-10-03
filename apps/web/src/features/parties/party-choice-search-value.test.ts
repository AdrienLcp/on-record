import { describe, expect, it } from 'vitest'

import {
  parsePartyChoices,
  partyChoicesSearchValue
} from './party-choice-search-value'

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

describe('partyChoicesSearchValue', () => {
  it('writes the choices back in chip order', () => {
    expect(partyChoicesSearchValue(['others', 'placePublique', 'rn'])).toBe(
      'rn,place-publique,autres'
    )
  })

  it('removes the parameter when nothing is chosen', () => {
    expect(partyChoicesSearchValue([])).toBeNull()
  })
})
