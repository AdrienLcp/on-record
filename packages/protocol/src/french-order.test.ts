import { describe, expect, it } from 'vitest'

import { compareFrench } from './french-order'

describe('compareFrench', () => {
  it('orders digits by value', () => {
    expect(['10', '2B', '971', '2A', '1'].toSorted(compareFrench)).toEqual([
      '1',
      '2A',
      '2B',
      '10',
      '971'
    ])
  })
})
