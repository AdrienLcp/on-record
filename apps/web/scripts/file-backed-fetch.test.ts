import { describe, expect, it } from 'vitest'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

import { createFileBackedFetch } from './file-backed-fetch.ts'

const MISSING_DATASET = `${DATASETS_BASE_PATH}/no-such-dataset.json`

describe('file-backed fetch', () => {
  it('rejects a request for a dataset file that is not there', async () => {
    const { fetch } = createFileBackedFetch()

    await expect(fetch(MISSING_DATASET)).rejects.toThrow(
      `a page fetched ${MISSING_DATASET}, which`
    )
  })

  it('throws the missing file again for the build, even once a reader swallowed it', async () => {
    const { fetch, throwOnRefusedRequests } = createFileBackedFetch()

    await fetch(MISSING_DATASET).catch(() => undefined)

    expect(throwOnRefusedRequests).toThrow('pnpm ingest writes it')
  })

  it('rejects and keeps a request outside the datasets', async () => {
    const { fetch, throwOnRefusedRequests } = createFileBackedFetch()

    await expect(fetch('https://example.com/a.json')).rejects.toThrow(
      'outside the datasets'
    )
    expect(throwOnRefusedRequests).toThrow('outside the datasets')
  })

  it('forgets the requests it has thrown', async () => {
    const { fetch, throwOnRefusedRequests } = createFileBackedFetch()

    await fetch(MISSING_DATASET).catch(() => undefined)

    expect(throwOnRefusedRequests).toThrow()
    expect(throwOnRefusedRequests).not.toThrow()
  })
})
