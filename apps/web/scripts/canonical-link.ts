import { setMetaContents } from '@adrienlcp/prerender'

import { createElement, onlyElement } from './document-elements.ts'
import { placeBefore } from './formatted-insertion.ts'

const CANONICAL = 'head > link[rel="canonical"]'

const OPEN_GRAPH_URL = 'property="og:url"'

/**
 * The module script Vite builds into the shell's head. What the head gains goes
 * ahead of it, so the browser finds it before it starts on the app.
 */
const ENTRY_SCRIPT = 'head > script[type="module"][src]'

/**
 * Adds the canonical link, pointing at `url`, to a shell written without one:
 * a shell the host also answers every client-rendered path with must not
 * claim each of them is its own page. Sets the shell's `og:url` to the same
 * URL, or adds one beside the link when the shell has none. A shell that
 * already holds a canonical link throws.
 */
export const addCanonical = ({
  document,
  url
}: {
  document: Document
  /** The page's absolute URL. */
  url: string
}): void => {
  if (document.querySelector(CANONICAL) !== null) {
    throw new Error('prerender: the shell already holds a canonical link')
  }

  const hasOpenGraphUrl =
    document.querySelector(`head > meta[${OPEN_GRAPH_URL}]`) !== null

  if (hasOpenGraphUrl) {
    setMetaContents({ document, metaContents: { [OPEN_GRAPH_URL]: url } })
  }

  placeBefore({
    nodes: [
      createElement({
        attributes: { href: url, rel: 'canonical' },
        document,
        tagName: 'link'
      }),
      ...(hasOpenGraphUrl
        ? []
        : [
            createElement({
              attributes: { content: url, property: 'og:url' },
              document,
              tagName: 'meta'
            })
          ])
    ],
    reference: onlyElement({ document, selector: ENTRY_SCRIPT })
  })
}
