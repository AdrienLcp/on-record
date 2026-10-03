import { describe, expect, it } from 'vitest'

import { compareDeputyNames } from './deputy-name-order'

const named = (lastName: string, firstName: string) => ({ firstName, lastName })

describe('compareDeputyNames', () => {
  it('orders by last name, then first name, an accent sorting with its base letter', () => {
    const deputies = [
      named('Été', 'Anne'),
      named('Durand', 'Zoé'),
      named('Durand', 'Ève'),
      named('Fable', 'Paul')
    ]

    expect(deputies.toSorted(compareDeputyNames)).toEqual([
      named('Durand', 'Ève'),
      named('Durand', 'Zoé'),
      named('Été', 'Anne'),
      named('Fable', 'Paul')
    ])
  })
})
