import {
  parseDocument,
  serializeDocument,
  setMetaContents
} from '@adrienlcp/prerender'
import { shellHead } from '@adrienlcp/prerender/vite'
import type { Plugin } from 'vite'

import { OPEN_GRAPH_IMAGE } from '../src/presentation/head/open-graph-image.ts'
import { SITE_ORIGIN } from '../src/presentation/head/site-origin.ts'
import { translate } from '../src/presentation/i18n/site-translator.ts'

const SHARE_CARD_META_CONTENTS: Readonly<Record<string, string>> = {
  'property="og:image:alt"': translate('head.shareImageAlt'),
  'property="og:image:height"': String(OPEN_GRAPH_IMAGE.height),
  'property="og:image:width"': String(OPEN_GRAPH_IMAGE.width),
  'property="og:image"': `${SITE_ORIGIN}${OPEN_GRAPH_IMAGE.path}`
}

/** `html` with the share card tags `index.html` leaves empty filled in. */
export const withShareCardTags = (html: string): string => {
  const document = parseDocument(html)

  setMetaContents({ document, metaContents: SHARE_CARD_META_CONTENTS })

  return serializeDocument(document)
}

/**
 * Fills the share card tags `index.html` leaves empty: a crawler needs the
 * image's absolute URL, its size lives beside the file it describes and its
 * alt in the dictionary. Every prerendered document inherits them.
 */
export const shareCardHead = (shell: string): Plugin =>
  shellHead({ filename: shell, metaContents: SHARE_CARD_META_CONTENTS })
