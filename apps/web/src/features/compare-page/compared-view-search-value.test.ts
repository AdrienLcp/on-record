import { describe, expect, it } from 'vitest'

import {
  comparedViewSearchValue,
  parseComparedView
} from './compared-view-search-value'

describe('view in the URL', () => {
  it('[compare] opens on the ledger and leaves that default out of the URL', () => {
    expect(parseComparedView(null)).toBe('ledger')
    expect(parseComparedView('texts')).toBe('ledger')
    expect(parseComparedView('camps')).toBe('camps')
    expect(comparedViewSearchValue('ledger')).toBeNull()
    expect(comparedViewSearchValue('camps')).toBe('camps')
    expect(parseComparedView('textes')).toBe('texts')
    expect(comparedViewSearchValue('texts')).toBe('textes')
  })
})
