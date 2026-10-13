import { readFile } from 'node:fs/promises'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

import {
  INGESTED_DATASETS_DIR,
  ingestedDatasetFileFor
} from './ingested-datasets.ts'

const urlOf = (input: string | URL | Request): string => {
  if (typeof input === 'string') {
    return input
  }

  return input instanceof URL ? input.href : input.url
}

/**
 * What the prerender installs as `fetch`. The site's dataset reader asks for
 * `DATASETS_BASE_PATH` on its own origin; at build time that is the `.data/`
 * folder ingest wrote, so the pages are written from the very files the
 * deployment publishes. A request outside the datasets, or for a file the
 * folder does not hold, throws: no document may depend on the network, nor be
 * written from a dataset that is not there.
 *
 * The site's reader turns a throwing `fetch` into a failure it renders, so
 * each refused request is also kept until `throwOnRefusedRequests` throws
 * them for the build to stop on.
 */
export const createFileBackedFetch = () => {
  const refusals: string[] = []

  const refuse = (message: string): Error => {
    refusals.push(message)

    return new Error(message)
  }

  const fetch = async (input: string | URL | Request): Promise<Response> => {
    const url = urlOf(input)

    if (!url.startsWith(`${DATASETS_BASE_PATH}/`)) {
      throw refuse(`prerender: a page fetched ${url}, outside the datasets`)
    }

    const file = ingestedDatasetFileFor(url.slice(DATASETS_BASE_PATH.length))

    if (file === null) {
      throw refuse(
        `prerender: a page fetched ${url}, which ${INGESTED_DATASETS_DIR} does not hold; pnpm ingest writes it`
      )
    }

    return new Response(await readFile(file), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    })
  }

  /** Throws every request refused since the last call, one per line, and forgets them. */
  const throwOnRefusedRequests = (): void => {
    if (refusals.length === 0) {
      return
    }

    const message = refusals.join('\n')
    refusals.length = 0

    throw new Error(message)
  }

  return { fetch, throwOnRefusedRequests }
}
