import { describe, expect, it } from 'vitest'

import { parseArticleDesignation } from './article-designation'

describe('parseArticleDesignation', () => {
  it('reads an article', () => {
    expect(parseArticleDesignation('ART. 3')).toEqual({
      designation: '3',
      kind: 'article',
      placement: 'on',
      plural: false
    })
  })

  it('reads the place of a new article', () => {
    expect(parseArticleDesignation('APRÈS ART. 1ER BIS')).toEqual({
      designation: '1er bis',
      kind: 'article',
      placement: 'after',
      plural: false
    })
    expect(parseArticleDesignation('AVANT ART. PREMIER')).toEqual({
      designation: 'premier',
      kind: 'article',
      placement: 'before',
      plural: false
    })
  })

  it('reads a range of articles', () => {
    expect(parseArticleDesignation('ART.S 3 TER À 3 OCTIES')).toEqual({
      designation: '3 ter à 3 octies',
      kind: 'article',
      placement: 'on',
      plural: true
    })
  })

  it('drops a repeated word and a trailing colon', () => {
    expect(parseArticleDesignation('ART. ARTICLE 3 BIS A')).toMatchObject({
      designation: '3 bis A'
    })
    expect(parseArticleDesignation('APRÈS ART. 64 :')).toMatchObject({
      designation: '64',
      placement: 'after'
    })
  })

  it('reads the title of the text', () => {
    expect(parseArticleDesignation('TITRE')).toEqual({ kind: 'title' })
  })

  it('keeps an unknown shape word for word', () => {
    expect(parseArticleDesignation('ANNEXE B')).toEqual({
      kind: 'other',
      text: 'ANNEXE B'
    })
  })
})
