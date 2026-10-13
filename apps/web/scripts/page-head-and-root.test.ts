import { parseDocument, serializeDocument } from '@adrienlcp/prerender'
import { describe, expect, it } from 'vitest'

import { addCanonical } from './canonical-link.ts'
import { insertScriptAfterRoot, setRootAttributes } from './page-root.ts'

/** A built `index.html` as Vite writes it, without a canonical link: the entry module in the head. */
const SHELL_HTML = [
  '<!DOCTYPE html>',
  '<html lang="fr"><head>',
  '<meta charset="utf-8">',
  '<title>Shell</title>',
  '<meta name="description" content="">',
  '<link rel="stylesheet" href="/assets/index.css">',
  '<script type="module" src="/assets/index.js"></script>',
  '</head><body><div id="root"></div></body></html>'
].join('')

/** The same shell as Vite prints it, one tag per line, indented. */
const INDENTED_SHELL_HTML = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Shell</title>
    <script type="module" src="/assets/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

/** The head's elements in order, each as its tag and its attributes sorted: linkedom does not keep the order they were set in. */
const headTags = (document: Document): string[] =>
  [...document.head.children].map((element) =>
    [
      element.tagName.toLowerCase(),
      ...[...element.attributes]
        .map(({ name, value }) => `${name}=${value}`)
        .toSorted()
    ].join(' ')
  )

describe('add canonical', () => {
  it('adds the canonical link and an og:url to a shell without them', () => {
    const document = parseDocument(SHELL_HTML)

    addCanonical({ document, url: 'https://example.com/deputes/PA1' })

    expect(headTags(document).slice(-3)).toEqual([
      'link href=https://example.com/deputes/PA1 rel=canonical',
      'meta content=https://example.com/deputes/PA1 property=og:url',
      'script src=/assets/index.js type=module'
    ])
  })

  it('sets the og:url the shell holds rather than add a second one', () => {
    const document = parseDocument(
      SHELL_HTML.replace(
        '<title>',
        '<meta property="og:url" content=""><title>'
      )
    )

    addCanonical({ document, url: 'https://example.com/a' })

    expect(headTags(document).filter((tag) => tag.includes('og:url'))).toEqual([
      'meta content=https://example.com/a property=og:url'
    ])
  })

  it('refuses a shell that already holds a canonical link', () => {
    const document = parseDocument(
      SHELL_HTML.replace(
        '<title>',
        '<link rel="canonical" href="https://example.com/"><title>'
      )
    )

    expect(() =>
      addCanonical({ document, url: 'https://example.com/a' })
    ).toThrow('already holds a canonical link')
  })

  it('ends the head of a shell built without an entry script', () => {
    const document = parseDocument(
      SHELL_HTML.replace(
        '<script type="module" src="/assets/index.js"></script>',
        ''
      )
    )

    addCanonical({ document, url: 'https://example.com/a' })

    expect(headTags(document).slice(-3)).toEqual([
      'link href=/assets/index.css rel=stylesheet',
      'link href=https://example.com/a rel=canonical',
      'meta content=https://example.com/a property=og:url'
    ])
  })

  it('fills the empty head of a shell without an entry script', () => {
    const document = parseDocument(
      '<!DOCTYPE html><html lang="fr"><head></head><body><div id="root"></div></body></html>'
    )

    addCanonical({ document, url: 'https://example.com/a' })

    expect(headTags(document)).toEqual([
      'link href=https://example.com/a rel=canonical',
      'meta content=https://example.com/a property=og:url'
    ])
  })

  it('refuses a shell with two entry scripts', () => {
    const document = parseDocument(
      SHELL_HTML.replace(
        '</head>',
        '<script type="module" src="/assets/other.js"></script></head>'
      )
    )

    expect(() =>
      addCanonical({ document, url: 'https://example.com/a' })
    ).toThrow('matched 2 elements, expected 1')
  })
})

describe('page root', () => {
  it('marks the root and sets a script right after it', () => {
    const document = parseDocument(SHELL_HTML)

    setRootAttributes({
      attributes: { 'data-prerendered-path': '/deputes' },
      document
    })
    insertScriptAfterRoot({ document, script: 'document.title' })

    expect(serializeDocument(document)).toContain(
      '<div data-prerendered-path="/deputes" id="root"></div><script>document.title</script></body>'
    )
  })

  it('refuses a script that would close its own tag', () => {
    expect(() =>
      insertScriptAfterRoot({
        document: parseDocument(SHELL_HTML),
        script: 'x = "</SCRIPT>"'
      })
    ).toThrow('would close its tag')
  })
})

describe('formatted insertion', () => {
  it('puts every tag it adds on a line of its own, indented as the shell is', () => {
    const document = parseDocument(INDENTED_SHELL_HTML)

    addCanonical({ document, url: 'https://example.com/a' })
    insertScriptAfterRoot({ document, script: 'document.title' })

    expect(serializeDocument(document)).toBe(`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <title>Shell</title>
    <link rel="canonical" href="https://example.com/a">
    <meta property="og:url" content="https://example.com/a">
    <script type="module" src="/assets/index.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>document.title</script>
  </body>
</html>`)
  })
})
