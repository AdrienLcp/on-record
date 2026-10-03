/**
 * React writes a component's `<title>` among the hoisted tags that open the
 * prerendered markup, which lands inside `#root`: the document's head takes
 * it from there.
 */
const RENDERED_TITLE = /<title>([^<]*)<\/title>/g

/** The entities React's server renderer escapes text with. */
const TEXT_ENTITIES: ReadonlyArray<
  readonly [entity: string, character: string]
> = [
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#x27;', "'"],
  ['&amp;', '&']
]

const unescapedText = (escaped: string): string =>
  TEXT_ENTITIES.reduce(
    (text, [entity, character]) => text.replaceAll(entity, character),
    escaped
  )

/**
 * The page's title and its markup without it: hydration skips hoisted tags,
 * and a `<title>` left in the body would be a second one for crawlers to read.
 */
export const takeRenderedTitle = ({
  html,
  path
}: {
  html: string
  path: string
}): { markup: string; title: string } => {
  const titles = [...html.matchAll(RENDERED_TITLE)]
  const [only] = titles

  if (titles.length !== 1 || only === undefined) {
    throw new Error(
      `prerender: ${path} rendered ${titles.length} <title> elements, expected exactly 1`
    )
  }

  return {
    markup: html.replace(only[0], ''),
    title: unescapedText(only[1] ?? '')
  }
}
