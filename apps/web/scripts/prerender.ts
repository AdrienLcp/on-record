import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { z } from 'zod'

import {
  DATASETS_BASE_PATH,
  datasetPaths,
  datasetsMetaSchema
} from '@on-record/protocol/datasets'

import type { PrerenderedPage } from '../src/entry-server'
import { fileBackedFetch } from './file-backed-fetch.ts'
import {
  appendStructuredData,
  appendToHead,
  fillRoot,
  type HeadTag,
  inlineStylesheets,
  parseHtml,
  requestedModulesOf,
  serializeHtml,
  setMeta,
  setTitle,
  stylesheetHrefsOf,
  takeRenderedTitle
} from './html-document.ts'
import { readJsonFile } from './read-json-file.ts'
import { sitemapXml } from './sitemap-xml.ts'
import { stalePageGuardFor } from './stale-page-guard.ts'

type EntryServer = typeof import('../src/entry-server')

const ROOT = resolve(import.meta.dirname, '..')
const CLIENT_DIR = join(ROOT, 'dist')
const SERVER_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js')

/** What the build emitted for each source module. */
const VITE_MANIFEST_FILE = '.vite/manifest.json'

const buildChunkSchema = z.object({
  css: z.array(z.string()).optional(),
  file: z.string(),
  imports: z.array(z.string()).optional()
})

type BuildChunk = z.infer<typeof buildChunkSchema>

const HOME_PATH = '/'

/**
 * `/` → `index.html`, `/deputes/PA1234` → `deputes/PA1234.html`: the host
 * serves `x.html` at `/x`, where `x/index.html` would redirect to `/x/`.
 */
const htmlFileForPath = (path: string): string =>
  path === HOME_PATH ? 'index.html' : `${path.slice(1)}.html`

const template = await readFile(join(CLIENT_DIR, 'index.html'), 'utf8')
const templateStylesheets = stylesheetHrefsOf(parseHtml(template))
const alreadyRequested = requestedModulesOf(parseHtml(template))

const buildManifest = await readJsonFile(
  join(CLIENT_DIR, VITE_MANIFEST_FILE),
  z.record(z.string(), buildChunkSchema)
)

const chunkAfterItsStaticImports = ({
  module,
  seen
}: {
  module: string
  seen: Set<string>
}): BuildChunk[] => {
  if (seen.has(module)) {
    return []
  }

  seen.add(module)

  const chunk = buildManifest[module]

  if (chunk === undefined) {
    throw new Error(
      `prerender: ${module} is not in Vite's manifest; routes.tsx names a module this build did not emit`
    )
  }

  return [
    ...(chunk.imports ?? []).flatMap((imported) =>
      chunkAfterItsStaticImports({ module: imported, seen })
    ),
    chunk
  ]
}

const stylesheets = new Map<string, string>()

const readStylesheet = async (href: string): Promise<string> => {
  const cached = stylesheets.get(href)

  if (cached !== undefined) {
    return cached
  }

  const css = await readFile(join(CLIENT_DIR, href.slice(1)), 'utf8')
  stylesheets.set(href, css)

  return css
}

/**
 * The document holds the whole page's markup, so inlining only what the
 * template links would paint it half-styled until the page's chunk arrives.
 */
const templateAndPageChunkStylesFor = async (
  module: string
): Promise<string> => {
  const hrefs = [
    ...new Set([
      ...templateStylesheets,
      ...chunkAfterItsStaticImports({ module, seen: new Set() }).flatMap(
        (chunk) => (chunk.css ?? []).map((file) => `/${file}`)
      )
    ])
  ]

  return (await Promise.all(hrefs.map(readStylesheet))).join('\n')
}

/**
 * The page's own chunk, which the router only reaches through a dynamic import
 * once the entry has run: named here, it downloads with everything else.
 */
const pageChunkPreloadsFor = (module: string): HeadTag[] =>
  chunkAfterItsStaticImports({ module, seen: new Set() })
    .map((chunk) => `/${chunk.file}`)
    .filter((href) => !alreadyRequested.has(href))
    .map((href) => ({
      attributes: { crossorigin: '', href, rel: 'modulepreload' },
      name: 'link'
    }))

/**
 * The home page carries no canonical link: its document is also what the host
 * answers for every client-rendered path, which must not all claim to be `/`.
 */
const addressTagsFor = (url: string): HeadTag[] => [
  { attributes: { href: url, rel: 'canonical' }, name: 'link' },
  { attributes: { content: url, property: 'og:url' }, name: 'meta' }
]

const documentFor = async ({
  datasetsGeneratedAt,
  origin,
  page,
  rendered
}: {
  datasetsGeneratedAt: string
  origin: string
  page: PrerenderedPage
  rendered: string
}): Promise<string> => {
  const { markup, title } = takeRenderedTitle({
    html: rendered,
    path: page.path
  })
  const document = parseHtml(template)

  setTitle(document, title)
  setMeta({
    document,
    identifyingAttribute: 'name="description"',
    value: page.head.description
  })
  setMeta({
    document,
    identifyingAttribute: 'property="og:title"',
    value: title
  })
  setMeta({
    document,
    identifyingAttribute: 'property="og:description"',
    value: page.head.description
  })
  inlineStylesheets(document, await templateAndPageChunkStylesFor(page.module))
  appendToHead(document, [
    ...(page.path === HOME_PATH ? [] : addressTagsFor(`${origin}${page.path}`)),
    ...pageChunkPreloadsFor(page.module)
  ])
  if (page.head.structuredData !== undefined) {
    appendStructuredData(document, page.head.structuredData)
  }
  if (page.path === HOME_PATH) {
    appendStructuredData(document, {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      description: page.head.description,
      inLanguage: document.documentElement.lang,
      name: document
        .querySelector('meta[property="og:site_name"]')
        ?.getAttribute('content'),
      url: `${origin}/`
    })
  }
  fillRoot({
    document,
    markup,
    ...stalePageGuardFor({ datasetsGeneratedAt, path: page.path })
  })

  return serializeHtml(document)
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

for (const page of pages) {
  const destination = join(CLIENT_DIR, htmlFileForPath(page.path))

  await mkdir(dirname(destination), { recursive: true })
  await writeFile(
    destination,
    await documentFor({
      datasetsGeneratedAt,
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
