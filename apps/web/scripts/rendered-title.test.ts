import { describe, expect, it } from 'vitest'

import { takeRenderedTitle } from './rendered-title'

const PATH = '/deputes/PA1234'

describe('takeRenderedTitle', () => {
  it('lifts the leading title out of the markup', () => {
    expect(
      takeRenderedTitle({
        html: '<title>Jean Dupont — on-record</title><main>Jean Dupont</main>',
        path: PATH
      })
    ).toEqual({
      markup: '<main>Jean Dupont</main>',
      title: 'Jean Dupont — on-record'
    })
  })

  it('reads back the text React escaped', () => {
    expect(
      takeRenderedTitle({
        html: '<title>L&#x27;article &lt;1&gt; &amp; &quot;la loi&quot;</title><main></main>',
        path: PATH
      }).title
    ).toBe(`L'article <1> & "la loi"`)
  })

  it('does not unescape twice', () => {
    expect(
      takeRenderedTitle({
        html: '<title>&amp;lt;</title><main></main>',
        path: PATH
      }).title
    ).toBe('&lt;')
  })

  it('fails a page that rendered no title', () => {
    expect(() =>
      takeRenderedTitle({ html: '<main></main>', path: PATH })
    ).toThrow(`${PATH} rendered 0 <title> elements`)
  })

  it('fails a page that rendered two titles', () => {
    expect(() =>
      takeRenderedTitle({
        html: '<title>A</title><title>B</title><main></main>',
        path: PATH
      })
    ).toThrow(`${PATH} rendered 2 <title> elements`)
  })
})
