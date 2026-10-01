import { cpSync, existsSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

import type { Plugin } from 'vite'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

/** Where `apps/ingest` writes the datasets, git-ignored. */
const INGESTED_DATASETS_DIR = resolve(import.meta.dirname, '../../../.data')

const isInside = ({ child, parent }: { child: string; parent: string }) => {
  const path = relative(parent, child)

  return path !== '' && !path.startsWith('..') && !isAbsolute(path)
}

const datasetFileFor = (requestUrl: string): string | null => {
  const pathname = decodeURIComponent(
    new URL(requestUrl, 'http://dev').pathname
  )
  const file = join(INGESTED_DATASETS_DIR, pathname)

  return isInside({ child: file, parent: INGESTED_DATASETS_DIR }) &&
    existsSync(file) &&
    statSync(file).isFile()
    ? file
    : null
}

/**
 * The site reads its datasets from `DATASETS_BASE_PATH` on its own origin. In
 * dev that path serves the repository's `.data/` folder as it is, and answers
 * 404 for a file it does not hold rather than letting the SPA fallback reply
 * with `index.html`. A build copies the folder into `dist/data`.
 */
export const datasetsPlugin = (): Plugin => ({
  configureServer: (server) => {
    if (!existsSync(INGESTED_DATASETS_DIR)) {
      server.config.logger.warn(
        `No datasets in ${INGESTED_DATASETS_DIR}: run \`pnpm ingest\` first.`
      )
    }

    server.middlewares.use(DATASETS_BASE_PATH, (request, response) => {
      const file = datasetFileFor(request.url ?? '/')

      if (file === null) {
        response.statusCode = 404
        response.end()
        return
      }

      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(readFileSync(file))
    })
  },
  name: 'on-record:datasets',
  writeBundle: (options) => {
    if (options.dir === undefined || !existsSync(INGESTED_DATASETS_DIR)) {
      return
    }

    cpSync(INGESTED_DATASETS_DIR, join(options.dir, DATASETS_BASE_PATH), {
      recursive: true
    })
  }
})
