import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Result } from '@adrienlcp/result'
import { strToU8, zipSync } from 'fflate'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { refreshSource } from '@/domain/ingest-service.ts'
import {
  senatorsSource,
  senatorsTables
} from '@/domain/senate-votes/senate-sources.ts'
import type { SourceValidators } from '@/domain/source-version.ts'
import {
  readCachedArchive,
  readCachedValidators,
  writeCachedArchive
} from '@/infrastructure/download-cache.ts'
import { RETRY_DELAYS_MS } from '@/infrastructure/open-data-client.ts'

vi.mock('node:timers/promises', () => ({ setTimeout: async () => {} }))

const source = {
  id: 'scrutins',
  url: 'https://data.example.fr/Scrutins.json.zip',
  validate: () => Result.success()
}
const cachedValidators = {
  etag: '"abc"',
  lastModified: 'Thu, 01 Oct 2026 04:26:24 GMT'
}

const respondWith = (status: number) =>
  vi.fn(async () => new Response(null, { status }))

const serveFile = (bytes: Uint8Array, validators: SourceValidators) =>
  vi.fn(
    async () =>
      new Response(new Uint8Array(bytes), {
        headers: {
          etag: validators.etag ?? '',
          'last-modified': validators.lastModified ?? ''
        },
        status: 200
      })
  )

/** A zipped senators dump holding a `COPY` block for each of `tables`. */
const senatorsDump = (tables: readonly string[]): Uint8Array =>
  zipSync({
    'export_sens.sql': strToU8(
      [
        '--',
        '-- PostgreSQL database dump',
        '--',
        '',
        "SET client_encoding = 'UTF8';",
        ...tables.flatMap((name) => [
          `COPY public.${name} (id) FROM stdin;`,
          '1',
          '\\.'
        ]),
        ''
      ].join('\n')
    )
  })

const goodDump = senatorsDump(Object.keys(senatorsTables))
const goodDumpValidators = {
  etag: '"good"',
  lastModified: 'Tue, 03 Nov 2026 02:43:10 GMT'
}
const newerValidators = {
  etag: '"newer"',
  lastModified: 'Thu, 05 Nov 2026 02:43:10 GMT'
}
const schemaLessDump = senatorsDump([])
const schemaLessDumpRejection = {
  code: 'invalid_raw_file',
  issues: 'tables missing from the dump: dpt, elusen, grppol, memgrppol, sen',
  path: senatorsSource.url
}

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
        rejectedDownload: null,
        source: {
          id: source.id,
          lastModified: cachedValidators.lastModified,
          url: source.url
        }
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

  it('[rejected-download] keeps the cached copy, bytes and validators, when the new version fails validation', async () => {
    await writeCachedArchive({
      bytes: goodDump,
      cacheDir,
      url: senatorsSource.url,
      validators: goodDumpValidators
    })
    vi.stubGlobal('fetch', serveFile(schemaLessDump, newerValidators))

    const check = await refreshSource(cacheDir, senatorsSource)

    expect(check.status === 'success' && check.data).toMatchObject({
      hasChanged: false,
      isReachable: true,
      rejectedDownload: {
        error: schemaLessDumpRejection,
        sourceId: senatorsSource.id
      },
      source: {
        id: senatorsSource.id,
        lastModified: goodDumpValidators.lastModified,
        url: senatorsSource.url
      }
    })
    expect(await readCachedArchive(cacheDir, senatorsSource.url)).toEqual(
      Result.success(goodDump)
    )
    expect(await readCachedValidators(cacheDir, senatorsSource.url)).toEqual(
      Result.success(goodDumpValidators)
    )
  })

  it('[rejected-download] fails the run when no cached copy can stand in', async () => {
    vi.stubGlobal('fetch', serveFile(schemaLessDump, newerValidators))

    const check = await refreshSource(cacheDir, senatorsSource)

    expect(check).toEqual(Result.failure(schemaLessDumpRejection))
    expect(await readCachedValidators(cacheDir, senatorsSource.url)).toEqual(
      Result.success(null)
    )
  })

  it('[rejected-download] lets a valid new version replace the cached copy', async () => {
    await writeCachedArchive({
      bytes: goodDump,
      cacheDir,
      url: senatorsSource.url,
      validators: goodDumpValidators
    })
    const newerDump = senatorsDump([
      ...Object.keys(senatorsTables),
      'commission'
    ])
    vi.stubGlobal('fetch', serveFile(newerDump, newerValidators))

    const check = await refreshSource(cacheDir, senatorsSource)

    expect(check.status === 'success' && check.data).toEqual({
      hasChanged: true,
      isReachable: true,
      rejectedDownload: null,
      source: {
        id: senatorsSource.id,
        lastModified: newerValidators.lastModified,
        url: senatorsSource.url
      }
    })
    expect(await readCachedArchive(cacheDir, senatorsSource.url)).toEqual(
      Result.success(newerDump)
    )
    expect(await readCachedValidators(cacheDir, senatorsSource.url)).toEqual(
      Result.success(newerValidators)
    )
  })
})
