import type { HeadTag } from './html-document.ts'

/**
 * The Latin faces nearly every page paints with. Written into prerendered
 * pages only: the `index.html` shell also serves client-rendered paths and the
 * not-found page, which paint nothing before the app runs, so a preload there
 * sits unused while the browser warns about it.
 */
const PRELOADED_FONTS = [
  '/fonts/atkinson-next-latin.woff2',
  '/fonts/atkinson-mono-latin.woff2'
] as const

export const FONT_PRELOADS: readonly HeadTag[] = PRELOADED_FONTS.map(
  (href) => ({
    attributes: {
      as: 'font',
      crossorigin: '',
      fetchpriority: 'low',
      href,
      rel: 'preload',
      type: 'font/woff2'
    },
    name: 'link'
  })
)
