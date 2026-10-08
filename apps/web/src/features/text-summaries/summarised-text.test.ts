import { describe, expect, it } from 'vitest'

import { FR_DICTIONARY } from '@/presentation/i18n/dictionary-fr'

import { summarisedFileOf, summaryWordsOf } from './summarised-text'

describe('summarisedFileOf', () => {
  it('finds the file of the latest reading that has one', () => {
    expect(
      summarisedFileOf([
        { legislativeFileId: null, number: 1 },
        { legislativeFileId: 'DLR5L17N54372', number: 8430 }
      ])
    ).toBe('DLR5L17N54372')
  })

  it('reaches the file of a solemn vote the open data leaves unfiled', () => {
    expect(summarisedFileOf([{ legislativeFileId: null, number: 2957 }])).toBe(
      'DLR5L17N50819'
    )
  })

  it('has none for a file nobody summarised', () => {
    expect(
      summarisedFileOf([{ legislativeFileId: 'DLR5L17N00000', number: 1 }])
    ).toBeNull()
  })
})

describe('summaryWordsOf', () => {
  it('lets a search find a text by a measure its official title never names', () => {
    expect(
      summaryWordsOf({ legislativeFileId: 'DLR5L17N54372', number: 8430 })
    ).toContain(FR_DICTIONARY.textSummaries.texts.DLR5L17N54372.summary)
  })
})
