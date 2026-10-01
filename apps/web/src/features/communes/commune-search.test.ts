import { describe, expect, it } from 'vitest'

import { toCommune } from './commune'
import { searchCommunes } from './commune-search'

const communes = [
  toCommune(['42218', 'Saint-Étienne', ['42000', '42100'], '42', [1, 2, 3]]),
  toCommune(['42207', 'Saint-Étienne-le-Molard', ['42130'], '42', [5]]),
  toCommune(['17306', 'Saint-Étienne-de-Lisse', ['33330'], '33', [9]]),
  toCommune(['75056', 'Paris', ['75001', '75015', '75116'], '75', [1, 12]]),
  toCommune(['01400', 'Vonnas', ['01540'], '01', [4]]),
  toCommune(['01250', 'Montrevel-en-Bresse', ['01340'], '01', [4]]),
  toCommune(['01069', 'Bresse Vallons', ['01340'], '01', [4]])
]

const namesFor = (query: string) =>
  searchCommunes({ communes, limit: 5, query }).map(({ name }) => name)

describe('searchCommunes', () => {
  it('[commune-search] finds a name typed without accents, case or hyphens', () => {
    expect(namesFor('saint etienne')).toEqual([
      'Saint-Étienne',
      'Saint-Étienne-de-Lisse',
      'Saint-Étienne-le-Molard'
    ])
  })

  it('[commune-search] offers every commune sharing a postcode', () => {
    expect(namesFor('01340')).toEqual(['Bresse Vallons', 'Montrevel-en-Bresse'])
  })

  it('[commune-search] offers every commune of a full postcode, beyond the limit', () => {
    expect(
      searchCommunes({ communes, limit: 1, query: '01340' }).map(
        ({ name }) => name
      )
    ).toEqual(['Bresse Vallons', 'Montrevel-en-Bresse'])
  })

  it('[commune-search] finds a city from the start of an arrondissement postcode', () => {
    expect(namesFor('7501')).toEqual(['Paris'])
  })

  it('[commune-search] matches a word inside a name after names that start with it', () => {
    expect(namesFor('bresse')).toEqual([
      'Bresse Vallons',
      'Montrevel-en-Bresse'
    ])
  })

  it('[commune-search] waits for two characters', () => {
    expect(namesFor('p')).toEqual([])
  })
})
