/** A tag a page's head gains, as the element's name and its attributes. */
export type AddressTag = {
  attributes: Readonly<Record<string, string>>
  tagName: 'link' | 'meta'
}

/** The canonical link and the share URL of the page served at `path` on `origin`. */
export const addressTagsFor = ({
  origin,
  path
}: {
  origin: string
  path: string
}): AddressTag[] => {
  const url = `${origin}${path}`

  return [
    { attributes: { href: url, rel: 'canonical' }, tagName: 'link' },
    { attributes: { content: url, property: 'og:url' }, tagName: 'meta' }
  ]
}
