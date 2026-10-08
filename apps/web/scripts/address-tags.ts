import type { HeadTag } from './html-document.ts'

/** The canonical link and the share URL of the page served at `path` on `origin`. */
export const addressTagsFor = ({
  origin,
  path
}: {
  origin: string
  path: string
}): HeadTag[] => {
  const url = `${origin}${path}`

  return [
    { attributes: { href: url, rel: 'canonical' }, name: 'link' },
    { attributes: { content: url, property: 'og:url' }, name: 'meta' }
  ]
}
