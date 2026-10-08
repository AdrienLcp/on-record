import { parseHTML } from 'linkedom'

/** A parsed HTML document, edited in place by the functions below. */
export type HtmlDocument = Document

/** A tag written into a document's head. */
export type HeadTag = {
  attributes: Record<string, string>
  name: 'link' | 'meta'
}

/**
 * A page parsed into the browser DOM. linkedom keeps the markup's own tree:
 * a fragment stays a fragment, with no `<html>` or `<body>` made up around it.
 */
export const parseHtml = (html: string): HtmlDocument =>
  parseHTML(html).document

/**
 * linkedom writes a `<title>` and attribute values as they are, without
 * escaping an `&`: a text that would read back differently, such as a literal
 * `&amp;`, fails the build instead of shipping altered.
 */
export const serializeHtml = (document: HtmlDocument): string => {
  const html = document.toString()

  if (parseHtml(html).toString() !== html) {
    throw new Error(
      'the edited document does not read back as written: a title or an attribute holds text that parses as a character reference'
    )
  }

  return html
}

/**
 * The one element `selector` names. `index.html` stays a valid standalone
 * document with no placeholder syntax, so a tag edited out of it fails the
 * build instead of leaving every document with the wrong head.
 */
const onlyElement = (document: HtmlDocument, selector: string): Element => {
  const found = document.querySelectorAll(selector)
  const [only] = found

  if (found.length !== 1 || only === undefined) {
    throw new Error(
      `${selector} matched ${found.length} elements in index.html, expected 1`
    )
  }

  return only
}

const setAttributes = (
  element: Element,
  attributes: Record<string, string>
): void => {
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, value)
  }
}

export const setTitle = (document: HtmlDocument, value: string): void => {
  onlyElement(document, 'head > title').textContent = value
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
  onlyElement(document, `head > meta[${identifyingAttribute}]`).setAttribute(
    'content',
    value
  )
}

const STYLESHEET_LINKS = 'link[rel="stylesheet"]'

const attributeValuesOf = ({
  attribute,
  document,
  selector
}: {
  attribute: string
  document: HtmlDocument
  selector: string
}): string[] =>
  [...document.querySelectorAll(selector)].flatMap(
    (element) => element.getAttribute(attribute) ?? []
  )

export const stylesheetHrefsOf = (document: HtmlDocument): string[] =>
  attributeValuesOf({ attribute: 'href', document, selector: STYLESHEET_LINKS })

/** Every stylesheet link the build emitted, replaced by one `<style>` holding `css` where the first one stood. */
export const inlineStylesheets = (
  document: HtmlDocument,
  css: string
): void => {
  const [first, ...others] = document.querySelectorAll(STYLESHEET_LINKS)

  if (first === undefined) {
    throw new Error(
      'index.html links no stylesheet, so there is nothing to inline'
    )
  }

  if (css.includes('</style')) {
    throw new Error(
      'a stylesheet would close the <style> tag it is inlined into'
    )
  }

  const style = document.createElement('style')
  style.textContent = css
  first.replaceWith(style)

  for (const link of others) {
    link.remove()
  }
}

/** The scripts and module preloads the document already asks for. */
export const requestedModulesOf = (document: HtmlDocument): Set<string> =>
  new Set([
    ...attributeValuesOf({
      attribute: 'src',
      document,
      selector: 'script[type="module"][src]'
    }),
    ...attributeValuesOf({
      attribute: 'href',
      document,
      selector: 'link[rel="modulepreload"][href]'
    })
  ])

export const appendToHead = (
  document: HtmlDocument,
  tags: readonly HeadTag[]
): void => {
  onlyElement(document, 'head').append(
    ...tags.map(({ attributes, name }) => {
      const element = document.createElement(name)
      setAttributes(element, attributes)

      return element
    })
  )
}

/**
 * JSON with every `<` written `<`: no string in it can close the
 * `<script>` it sits in.
 */
export const scriptSafeJson = (data: unknown): string =>
  JSON.stringify(data).replaceAll('<', '\\u003c')

/** Appends `data` to the head as a JSON-LD `<script>`. */
export const appendStructuredData = (
  document: HtmlDocument,
  data: Record<string, unknown>
): void => {
  const script = document.createElement('script')
  script.setAttribute('type', 'application/ld+json')
  script.textContent = scriptSafeJson(data)
  onlyElement(document, 'head').append(script)
}

/**
 * Fills `#root` with a page's markup, then sets `script` right after it.
 * linkedom lowercases every tag name, so an SVG element spelled in camelCase
 * (`linearGradient`, `clipPath`) would not survive the prerender.
 */
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

  if (root.children.length > 0) {
    throw new Error('#root is not empty in index.html')
  }

  setAttributes(root, attributes)
  root.innerHTML = markup

  const inlineScript = document.createElement('script')
  inlineScript.textContent = script
  root.after(inlineScript)
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
  const fragment = parseHtml(html)
  const titles = fragment.querySelectorAll('title')
  const [title] = titles

  if (titles.length !== 1 || title === undefined) {
    throw new Error(
      `prerender: ${path} rendered ${titles.length} <title> elements, expected exactly 1`
    )
  }

  const text = title.textContent ?? ''
  title.remove()

  return { markup: fragment.toString(), title: text }
}
