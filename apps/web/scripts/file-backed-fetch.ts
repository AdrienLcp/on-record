import { readFile } from 'node:fs/promises'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

import { ingestedDatasetFileFor } from './ingested-datasets.ts'

const HTTP_NOT_FOUND = 404

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
 * deployment publishes. Any other request throws: no document may depend on
 * the network to be written.
 */
export const fileBackedFetch = async (
  input: string | URL | Request
): Promise<Response> => {
  const url = urlOf(input)

  if (!url.startsWith(`${DATASETS_BASE_PATH}/`)) {
    throw new Error(`prerender: a page fetched ${url}, outside the datasets`)
  }

  const file = ingestedDatasetFileFor(url.slice(DATASETS_BASE_PATH.length))

  if (file === null) {
    return new Response(null, { status: HTTP_NOT_FOUND })
  }

  return new Response(await readFile(file), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}
