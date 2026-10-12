import { onlyElement } from './document-elements.ts'
import { placeAfter } from './formatted-insertion.ts'

const ROOT = '#root'

const SCRIPT_CLOSING_TAG = /<\/script/i

/**
 * Sets `attributes` on `#root`: what the app reads before it takes the page
 * over. React renders inside the root and never touches its own attributes,
 * so they stay through hydration.
 */
export const setRootAttributes = ({
  attributes,
  document
}: {
  attributes: Readonly<Record<string, string>>
  document: Document
}): void => {
  const root = onlyElement({ document, selector: ROOT })

  for (const [name, value] of Object.entries(attributes)) {
    root.setAttribute(name, value)
  }
}

/**
 * Sets a classic inline script right after `#root`. The parser runs it as
 * soon as the root is parsed, before the first paint and before any module
 * script, so it can read or empty the prerendered page.
 */
export const insertScriptAfterRoot = ({
  document,
  script
}: {
  document: Document
  /** The script's source, run as it is. */
  script: string
}): void => {
  if (SCRIPT_CLOSING_TAG.test(script)) {
    throw new Error(
      'prerender: the script after the root holds </script, which would close its tag'
    )
  }

  const element = document.createElement('script')

  element.textContent = script
  placeAfter({
    nodes: [element],
    reference: onlyElement({ document, selector: ROOT })
  })
}
