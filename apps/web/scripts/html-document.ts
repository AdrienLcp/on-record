import { type CheerioAPI, load } from 'cheerio'

/** A parsed HTML document, edited in place by the functions below. */
export type HtmlDocument = CheerioAPI

/** A tag written into a document's head. */
export type HeadTag = {
  attributes: Record<string, string>
  name: 'link' | 'meta'
}

export const parseHtml = (html: string): HtmlDocument => load(html)

/** A fragment, such as the markup a page rendered, parsed without a document around it. */
const parseFragment = (html: string): HtmlDocument => load(html, null, false)

export const serializeHtml = (document: HtmlDocument): string => document.html()

/**
 * The one element `selector` names. `index.html` stays a valid standalone
 * document with no placeholder syntax, so a tag edited out of it fails the
 * build instead of leaving every document with the wrong head.
 */
const onlyElement = (document: HtmlDocument, selector: string) => {
  const found = document(selector)

  if (found.length !== 1) {
    throw new Error(
      `${selector} matched ${found.length} elements in index.html, expected 1`
    )
  }

  return found
}

export const setTitle = (document: HtmlDocument, value: string): void => {
  onlyElement(document, 'head > title').text(value)
}

export const setMeta = ({
  document,
  identifyingAttribute,
  value
}: {
  document: HtmlDocument
  /** `name="description"`, `property="og:title"`. */
  identifyingAttribute: string
  value: string
}): void => {
  onlyElement(document, `head > meta[${identifyingAttribute}]`).attr(
    'content',
    value
  )
}

const STYLESHEET_LINKS = 'link[rel="stylesheet"]'

export const stylesheetHrefsOf = (document: HtmlDocument): string[] =>
  document(STYLESHEET_LINKS)
    .map((_index, link) => document(link).attr('href'))
    .get()

/** Every stylesheet link the build emitted, replaced by one `<style>` holding `css` where the first one stood. */
export const inlineStylesheets = (
  document: HtmlDocument,
  css: string
): void => {
  const links = document(STYLESHEET_LINKS)

  if (links.length === 0) {
    throw new Error(
      'index.html links no stylesheet, so there is nothing to inline'
    )
  }

  if (css.includes('</style')) {
    throw new Error(
      'a stylesheet would close the <style> tag it is inlined into'
    )
  }

  links.first().before(document('<style>').text(css))
  links.remove()
}

/** The scripts and module preloads the document already asks for. */
export const requestedModulesOf = (document: HtmlDocument): Set<string> =>
  new Set([
    ...document('script[type="module"][src]')
      .map((_index, script) => document(script).attr('src'))
      .get(),
    ...document('link[rel="modulepreload"][href]')
      .map((_index, link) => document(link).attr('href'))
      .get()
  ])

export const appendToHead = (
  document: HtmlDocument,
  tags: readonly HeadTag[]
): void => {
  const head = onlyElement(document, 'head')

  for (const tag of tags) {
    head.append(document(`<${tag.name}>`).attr(tag.attributes))
  }
}

/** Fills `#root` with a page's markup, then sets `script` right after it. */
export const fillRoot = ({
  attributes,
  document,
  markup,
  script
}: {
  attributes: Record<string, string>
  document: HtmlDocument
  markup: string
  script: string
}): void => {
  const root = onlyElement(document, '#root')

  if (root.children().length > 0) {
    throw new Error('#root is not empty in index.html')
  }

  root.attr(attributes).html(markup)
  root.after(document('<script>').text(script))
}

/**
 * React writes a component's `<title>` among the hoisted tags that open the
 * prerendered markup, which lands inside `#root`: the document's head takes
 * it from there. Hydration skips hoisted tags, and a `<title>` left in the
 * body would be a second one for crawlers to read.
 */
export const takeRenderedTitle = ({
  html,
  path
}: {
  html: string
  path: string
}): { markup: string; title: string } => {
  const fragment = parseFragment(html)
  const titles = fragment('title')

  if (titles.length !== 1) {
    throw new Error(
      `prerender: ${path} rendered ${titles.length} <title> elements, expected exactly 1`
    )
  }

  const title = titles.text()
  titles.remove()

  return { markup: fragment.html(), title }
}
