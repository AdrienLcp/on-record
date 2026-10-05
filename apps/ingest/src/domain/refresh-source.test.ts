import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { refreshSource } from '@/domain/ingest-service.ts'
import { writeCachedArchive } from '@/infrastructure/download-cache.ts'
import { RETRY_DELAYS_MS } from '@/infrastructure/open-data-client.ts'

vi.mock('node:timers/promises', () => ({ setTimeout: async () => {} }))

const source = {
  id: 'scrutins',
  url: 'https://data.example.fr/Scrutins.json.zip'
}
const cachedValidators = {
  etag: '"abc"',
  lastModified: 'Thu, 01 Oct 2026 04:26:24 GMT'
}

const respondWith = (status: number) =>
  vi.fn(async () => new Response(null, { status }))

let cacheDir: string

beforeEach(async () => {
  cacheDir = await mkdtemp(join(tmpdir(), 'on-record-cache-'))
})

afterEach(async () => {
  vi.unstubAllGlobals()
  await rm(cacheDir, { force: true, recursive: true })
})

describe('refreshSource', () => {
  it('[publisher-down] keeps the cached copy when the server answers 504 on every retry', async () => {
    await writeCachedArchive({
      bytes: new Uint8Array([1]),
      cacheDir,
      url: source.url,
      validators: cachedValidators
    })
    const fetchMock = respondWith(504)
    vi.stubGlobal('fetch', fetchMock)

    const check = await refreshSource(cacheDir, source)

    expect(fetchMock).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1)
    expect(check).toEqual({
      data: {
        hasChanged: false,
        isReachable: false,
        source: { ...source, lastModified: cachedValidators.lastModified }
      },
      status: 'success'
    })
  })

  it('[publisher-down] fails a source never downloaded', async () => {
    vi.stubGlobal('fetch', respondWith(504))

    const check = await refreshSource(cacheDir, source)

    expect(check.status).toBe('failure')
  })

  it('[publisher-down] recovers when a retry succeeds', async () => {
    await writeCachedArchive({
      bytes: new Uint8Array([1]),
      cacheDir,
      url: source.url,
      validators: cachedValidators
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 502 }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }))
    vi.stubGlobal('fetch', fetchMock)

    const check = await refreshSource(cacheDir, source)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(check.status === 'success' && check.data.isReachable).toBe(true)
  })

  it('[client-error] does not retry a 404', async () => {
    const fetchMock = respondWith(404)
    vi.stubGlobal('fetch', fetchMock)

    await refreshSource(cacheDir, source)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
