/**
 * The share card every page unfurls with, committed in `public/`. Its size is
 * announced in each document's head and is the size the file was shot at. Its
 * alt text is the dictionary's `head.shareImageAlt`.
 */
export const OPEN_GRAPH_IMAGE = {
  height: 630,
  path: '/og.png',
  width: 1200
} as const
