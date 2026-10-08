import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  addFontPreloads,
  appendStructuredData,
  type BuildManifest,
  createElement,
  htmlFileForPath,
  inlinePageStylesheets,
  insertIntoHead,
  parseDocument,
  readBuildManifest,
  renderIntoShell,
  serializeDocument,
  setMetaContents
} from '@adrienlcp/prerender'

import {
  DATASETS_BASE_PATH,
  datasetPaths,
  datasetsMetaSchema
} from '@on-record/protocol/datasets'

import type { PrerenderedPage } from '../src/entry-server'
import { fileBackedFetch } from './file-backed-fetch.ts'
import { sitemapXml } from './sitemap-xml.ts'
import { addStalePageGuard } from './stale-page-guard.ts'

type EntryServer = typeof import('../src/entry-server')

const ROOT = resolve(import.meta.dirname, '..')
const CLIENT_DIR = join(ROOT, 'dist')
const SERVER_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js')

const HOME_PATH = '/'

const shell = await readFile(join(CLIENT_DIR, 'index.html'), 'utf8')

/**
 * The home page carries no canonical link: its document is also what the host
 * answers for every client-rendered path, which must not all claim to be `/`.
 */
const addAddressTags = ({
  document,
  url
}: {
  document: Document
  url: string
}): void => {
  insertIntoHead({
    document,
    elements: [
      createElement({
        attributes: { href: url, rel: 'canonical' },
        document,
        tagName: 'link'
      }),
      createElement({
        attributes: { content: url, property: 'og:url' },
        document,
        tagName: 'meta'
      })
    ]
  })
}

const documentFor = async ({
  datasetsGeneratedAt,
  manifest,
  origin,
  page,
  rendered
}: {
  datasetsGeneratedAt: string
  manifest: BuildManifest
  origin: string
  page: PrerenderedPage
  rendered: string
}): Promise<string> => {
  const document = parseDocument(shell)
  const { title } = renderIntoShell({
    document,
    html: rendered,
    path: page.path
  })

  setMetaContents({
    document,
    metaContents: {
      'name="description"': page.head.description,
      'property="og:description"': page.head.description,
      'property="og:title"': title
    }
  })

  const { css } = await inlinePageStylesheets({
    clientDir: CLIENT_DIR,
    document,
    manifest,
    modules: [page.module]
  })

  addFontPreloads({ css, document })
  if (page.path !== HOME_PATH) {
    addAddressTags({ document, url: `${origin}${page.path}` })
  }
  if (page.head.structuredData !== undefined) {
    appendStructuredData({ data: page.head.structuredData, document })
  }
  if (page.path === HOME_PATH) {
    appendStructuredData({
      data: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        description: page.head.description,
        inLanguage: document.documentElement.lang,
        name: document
          .querySelector('meta[property="og:site_name"]')
          ?.getAttribute('content'),
        url: `${origin}/`
      },
      document
    })
  }
  addStalePageGuard({ datasetsGeneratedAt, document, path: page.path })

  return serializeDocument(document)
}

const robotsFor = (origin: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`

const filesBelow = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
}

const MEBIBYTE = 1024 * 1024

globalThis.fetch = fileBackedFetch

const { generatedAt: datasetsGeneratedAt } = datasetsMetaSchema.parse(
  await (await fetch(`${DATASETS_BASE_PATH}/${datasetPaths.meta}`)).json()
)

const {
  listPrerenderedPages,
  MAX_PUBLISHED_FILES,
  prerenderPath,
  SITE_ORIGIN
}: EntryServer = await import(pathToFileURL(SERVER_ENTRY).href)

const pages = await listPrerenderedPages(new AbortController().signal)
const manifest = await readBuildManifest(CLIENT_DIR)

for (const page of pages) {
  const destination = join(CLIENT_DIR, htmlFileForPath(page.path))

  await mkdir(dirname(destination), { recursive: true })
  await writeFile(
    destination,
    await documentFor({
      datasetsGeneratedAt,
      manifest,
      origin: SITE_ORIGIN,
      page,
      rendered: await prerenderPath(page.path)
    }),
    'utf8'
  )
}

await writeFile(
  join(CLIENT_DIR, 'sitemap.xml'),
  await sitemapXml({
    origin: SITE_ORIGIN,
    paths: pages.map(({ path }) => path)
  }),
  'utf8'
)
await writeFile(join(CLIENT_DIR, 'robots.txt'), robotsFor(SITE_ORIGIN), 'utf8')

const published = await filesBelow(CLIENT_DIR)
const sizes = await Promise.all(
  published.map(async (file) => (await stat(file)).size)
)
const totalMebibytes = sizes.reduce((sum, size) => sum + size, 0) / MEBIBYTE

if (published.length > MAX_PUBLISHED_FILES) {
  throw new Error(
    `prerender: ${CLIENT_DIR} holds ${published.length} files, over the budget of ${MAX_PUBLISHED_FILES} per deployment`
  )
}

console.info(
  `prerendered ${pages.length} documents at ${SITE_ORIGIN}; ${CLIENT_DIR} holds ${published.length} files (budget ${MAX_PUBLISHED_FILES}), ${totalMebibytes.toFixed(1)} MiB`
)
