/**
 * The one element `selector` matches. The shell stays a valid standalone
 * document with no placeholder syntax, so a tag edited out of it fails the
 * build instead of leaving every page with the wrong head.
 */
export const onlyElement = ({
  document,
  selector
}: {
  document: Document
  selector: string
}): Element => {
  const matches = document.querySelectorAll(selector)
  const [only] = matches

  if (matches.length !== 1 || only === undefined) {
    throw new Error(
      `prerender: ${selector} matched ${matches.length} elements, expected 1`
    )
  }

  return only
}

/** An element with these attributes, in that order. */
export const createElement = ({
  attributes,
  document,
  tagName
}: {
  attributes: Readonly<Record<string, string>>
  document: Document
  tagName: string
}): Element => {
  const element = document.createElement(tagName)

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }

  return element
}
