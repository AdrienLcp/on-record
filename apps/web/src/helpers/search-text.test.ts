import { describe, expect, it } from 'vitest'

import { matchesQuery, searchableText } from './search-text'

describe('searchableText', () => {
  it('[search] drops case, accents and punctuation', () => {
    expect(searchableText('  Jean-Pierre LEFÈVRE ')).toBe('jean pierre lefevre')
  })
})

describe('matchesQuery', () => {
  it('[search] finds a name typed without its accents', () => {
    expect(matchesQuery({ query: 'lefevre', text: 'Jules Lefèvre' })).toBe(true)
  })

  it('[search] needs every word, in any order', () => {
    expect(
      matchesQuery({ query: 'lefevre jules', text: 'Jules Lefèvre' })
    ).toBe(true)
    expect(matchesQuery({ query: 'lefevre zoe', text: 'Jules Lefèvre' })).toBe(
      false
    )
  })

  it('[search] lets an empty query match everything', () => {
    expect(matchesQuery({ query: '  ', text: 'Jules Lefèvre' })).toBe(true)
  })
})
