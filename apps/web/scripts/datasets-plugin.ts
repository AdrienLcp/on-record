import { cpSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Plugin } from 'vite'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

import {
  INGESTED_DATASETS_DIR,
  ingestedDatasetFileFor
} from './ingested-datasets.ts'

/**
 * The site reads its datasets from `DATASETS_BASE_PATH` on its own origin. In
 * dev that path serves the repository's `.data/` folder as it is, and answers
 * 404 for a file it does not hold rather than letting the SPA fallback reply
 * with `index.html`. A client build copies the folder into `dist/data`; the
 * server build, which only feeds the prerender, copies nothing.
 */
export const datasetsPlugin = (): Plugin => ({
  configureServer: (server) => {
    if (!existsSync(INGESTED_DATASETS_DIR)) {
      server.config.logger.warn(
        `No datasets in ${INGESTED_DATASETS_DIR}: run \`pnpm ingest\` first.`
      )
    }

    server.middlewares.use(DATASETS_BASE_PATH, (request, response) => {
      const file = ingestedDatasetFileFor(request.url ?? '/')

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
  writeBundle(options) {
    if (
      this.environment.config.consumer === 'server' ||
      options.dir === undefined ||
      !existsSync(INGESTED_DATASETS_DIR)
    ) {
      return
    }

    cpSync(INGESTED_DATASETS_DIR, join(options.dir, DATASETS_BASE_PATH), {
      recursive: true
    })
  }
})
