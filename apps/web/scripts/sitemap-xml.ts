import { SitemapStream, streamToPromise } from 'sitemap'

/** `sitemap.xml` listing `paths` on `origin`, in the core namespace only. */
export const sitemapXml = async ({
  origin,
  paths
}: {
  origin: string
  paths: readonly string[]
}): Promise<string> => {
  const sitemap = new SitemapStream({
    hostname: origin,
    xmlns: { image: false, news: false, video: false, xhtml: false }
  })

  for (const url of paths) {
    sitemap.write({ url })
  }

  sitemap.end()

  return (await streamToPromise(sitemap)).toString()
}
