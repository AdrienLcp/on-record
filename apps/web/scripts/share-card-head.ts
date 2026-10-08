import type { Plugin } from 'vite'

import { OPEN_GRAPH_IMAGE } from '../src/presentation/head/open-graph-image.ts'
import { SITE_ORIGIN } from '../src/presentation/head/site-origin.ts'
import { translate } from '../src/presentation/i18n/site-translator.ts'
import { parseHtml, serializeHtml, setMeta } from './html-document.ts'

/** `html` with the share card tags `index.html` leaves empty filled in. */
export const withShareCardTags = (html: string): string => {
  const document = parseHtml(html)
  const tags: Record<string, string> = {
    'property="og:image:alt"': translate('head.shareImageAlt'),
    'property="og:image:height"': String(OPEN_GRAPH_IMAGE.height),
    'property="og:image:width"': String(OPEN_GRAPH_IMAGE.width),
    'property="og:image"': `${SITE_ORIGIN}${OPEN_GRAPH_IMAGE.path}`
  }

  for (const [identifyingAttribute, value] of Object.entries(tags)) {
    setMeta({ document, identifyingAttribute, value })
  }

  return serializeHtml(document)
}

/**
 * Fills the share card tags: a crawler needs the image's absolute URL, its
 * size lives beside the file it describes and its alt in the dictionary.
 * Every prerendered document inherits them.
 */
export const shareCardHead = (): Plugin => ({
  name: 'on-record:share-card-head',
  transformIndexHtml: withShareCardTags
})
