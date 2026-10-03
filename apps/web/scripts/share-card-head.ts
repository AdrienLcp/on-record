import type { Plugin } from 'vite'

import { OPEN_GRAPH_IMAGE } from '../src/presentation/head/open-graph-image.ts'
import { SITE_ORIGIN } from '../src/presentation/head/site-origin.ts'
import { translate } from '../src/presentation/i18n/site-translator.ts'
import { setMeta } from './head-tags.ts'

/**
 * Fills the share card tags `index.html` leaves empty: a crawler needs the
 * image's absolute URL, its size lives beside the file it describes and its
 * alt in the dictionary. Every prerendered document inherits them.
 */
export const shareCardHead = (): Plugin => ({
  name: 'on-record:share-card-head',
  transformIndexHtml: (html) =>
    [
      (next: string) =>
        setMeta({
          html: next,
          identifyingAttribute: 'property="og:image"',
          value: `${SITE_ORIGIN}${OPEN_GRAPH_IMAGE.path}`
        }),
      (next: string) =>
        setMeta({
          html: next,
          identifyingAttribute: 'property="og:image:width"',
          value: String(OPEN_GRAPH_IMAGE.width)
        }),
      (next: string) =>
        setMeta({
          html: next,
          identifyingAttribute: 'property="og:image:height"',
          value: String(OPEN_GRAPH_IMAGE.height)
        }),
      (next: string) =>
        setMeta({
          html: next,
          identifyingAttribute: 'property="og:image:alt"',
          value: translate('head.shareImageAlt')
        })
    ].reduce((next, write) => write(next), html)
})
