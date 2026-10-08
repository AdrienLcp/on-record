import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, test, vi } from 'vitest'

import { paths } from '@/infrastructure/router/navigation'
import { listPrerenderedPages } from '@/infrastructure/router/prerendered-pages'
import { SITE_ORIGIN } from '@/presentation/head/site-origin'

import { addressTagsFor } from './address-tags.ts'
import { parseHtml } from './html-document.ts'
import { withShareCardTags } from './share-card-head.ts'
import { sitemapXml } from './sitemap-xml.ts'

vi.mock('@/features/deputies/directory-api', async () => {
  const { Result } = await import('@adrienlcp/result')

  return {
    fetchDirectory: async () => Result.success({ deputies: [], groups: [] })
  }
})

vi.mock('@/features/scrutins/scrutins-api', async () => {
  const { Result } = await import('@adrienlcp/result')

  return { fetchScrutinIndex: async () => Result.success([]) }
})

vi.mock('@/features/senators/senators-api', async () => {
  const { Result } = await import('@adrienlcp/result')

  return {
    fetchSenateDirectory: async () =>
      Result.success({ groups: [], senators: [] })
  }
})

vi.mock('@/features/senate-scrutins/senate-scrutins-api', async () => {
  const { Result } = await import('@adrienlcp/result')

  return {
    fetchSenateScrutinIndex: async () => Result.success({ scrutins: [] })
  }
})

const ROOT_DIRECTORY = resolve(import.meta.dirname, '..')
const PUBLIC_DIRECTORY = resolve(ROOT_DIRECTORY, 'public')
const HEAD = parseHtml(
  withShareCardTags(readFileSync(resolve(ROOT_DIRECTORY, 'index.html'), 'utf8'))
)

const ogProperty = (property: string): string =>
  HEAD.querySelector(`meta[property="og:${property}"]`)?.getAttribute(
    'content'
  ) ?? ''

/** A PNG's IHDR chunk holds its width then its height, big-endian, from byte 16. */
const pngSize = (bytes: Buffer): string =>
  `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`

/** The routes a reader reaches with no identifier: every one is its own document. */
const FIXED_ROUTE_PATHS = Object.values(paths).filter(
  (path) => !path.includes(':')
)

const locsOf = (sitemap: string): string[] =>
  [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) => loc ?? '')

describe('share card', () => {
  test('points at an image on the site', () => {
    expect(ogProperty('image')).toMatch(new RegExp(`^${SITE_ORIGIN}/`))
  })

  test('ships its image at the size it announces', () => {
    const image = ogProperty('image').replace(SITE_ORIGIN, '')
    const bytes = readFileSync(resolve(PUBLIC_DIRECTORY, `.${image}`))

    expect(pngSize(bytes)).toBe(
      `${ogProperty('image:width')}x${ogProperty('image:height')}`
    )
  })

  test.each(FIXED_ROUTE_PATHS)(
    'builds the share URL of %s on the site',
    (path) => {
      const shareUrl = addressTagsFor({ origin: SITE_ORIGIN, path }).find(
        ({ attributes }) => attributes.property === 'og:url'
      )?.attributes.content

      expect(shareUrl).toBe(`${SITE_ORIGIN}${path}`)
    }
  )
})

describe('sitemap', () => {
  test('lists exactly the routes the router serves', async () => {
    const pages = await listPrerenderedPages(new AbortController().signal)
    const sitemap = await sitemapXml({
      origin: SITE_ORIGIN,
      paths: pages.map(({ path }) => path)
    })

    expect(locsOf(sitemap).toSorted()).toEqual(
      FIXED_ROUTE_PATHS.map((path) => `${SITE_ORIGIN}${path}`).toSorted()
    )
  })
})
