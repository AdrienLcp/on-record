import { describe, expect, it } from 'vitest'

import type { Declaration } from '@on-record/protocol/hatvp/hatvp-record'

import { declarationPhrasesOf, readableUrlOf } from './declaration-phrases'

const declaration = (overrides: Partial<Declaration>): Declaration => ({
  filedOn: '2024-08-04',
  kind: 'interests',
  pdfUrl: 'https://www.hatvp.fr/livraison/dossiers/a-dia1-depute-69.pdf',
  publishedOn: '2025-06-17',
  status: 'published',
  ...overrides
})

describe('declarationPhrasesOf', () => {
  it('[hatvp] dates a published declaration of interests twice', () => {
    expect(declarationPhrasesOf(declaration({}))).toEqual([
      { day: '2024-08-04', key: 'filed' },
      { day: '2025-06-17', key: 'published' }
    ])
  })

  it('[hatvp] sends an asset declaration to the prefecture, with no publication date', () => {
    expect(
      declarationPhrasesOf(declaration({ kind: 'assets', pdfUrl: null }))
    ).toEqual([{ day: '2024-08-04', key: 'filed' }, { key: 'prefecture' }])
  })

  it('[hatvp] says a declaration in progress is not published yet, with no date', () => {
    expect(
      declarationPhrasesOf(
        declaration({
          filedOn: null,
          pdfUrl: null,
          publishedOn: null,
          status: 'inProgress'
        })
      )
    ).toEqual([{ key: 'inProgress' }])
  })
})

describe('readableUrlOf', () => {
  it('[hatvp] never links an asset declaration', () => {
    expect(
      readableUrlOf(
        declaration({
          kind: 'assetsUpdate',
          pdfUrl:
            'https://www.hatvp.fr/livraison/dossiers/a-dspm1-depute-69.pdf'
        })
      )
    ).toBeNull()
  })
})
