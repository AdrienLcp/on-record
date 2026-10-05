import { setTimeout as wait } from 'node:timers/promises'

import { Result } from '@adrienlcp/result'
import { unzipSync } from 'fflate'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type { SourceValidators } from '@/domain/source-version.ts'

const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000
const HTTP_NOT_MODIFIED = 304
const HTTP_TOO_MANY_REQUESTS = 429
const HTTP_SERVER_ERROR = 500

/** Waits before each retry: the publishers' gateways answer 502/504 for minutes at a time. */
export const RETRY_DELAYS_MS = [30_000, 120_000, 300_000] as const

export type ArchiveDownload =
  | { status: 'unchanged' }
  | { bytes: Uint8Array; status: 'downloaded'; validators: SourceValidators }

const conditionalHeaders = (
  validators: SourceValidators | null
): Record<string, string> => ({
  ...(validators?.etag ? { 'If-None-Match': validators.etag } : {}),
  ...(validators?.lastModified
    ? { 'If-Modified-Since': validators.lastModified }
    : {})
})

type DownloadAttempt = {
  isTransient: boolean
  result: Result<ArchiveDownload, IngestError>
}

const isTransientStatus = (status: number): boolean =>
  status === HTTP_TOO_MANY_REQUESTS || status >= HTTP_SERVER_ERROR

const attemptDownload = async (
  url: string,
  cached: SourceValidators | null
): Promise<DownloadAttempt> => {
  try {
    const response = await fetch(url, {
      headers: conditionalHeaders(cached),
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
    })
    if (response.status === HTTP_NOT_MODIFIED) {
      return {
        isTransient: false,
        result: Result.success({ status: 'unchanged' })
      }
    }
    if (!response.ok) {
      return {
        isTransient: isTransientStatus(response.status),
        result: Result.failure({
          code: 'download_failed',
          reason: `HTTP ${response.status}`,
          url
        })
      }
    }
    return {
      isTransient: false,
      result: Result.success({
        bytes: new Uint8Array(await response.arrayBuffer()),
        status: 'downloaded',
        validators: {
          etag: response.headers.get('etag'),
          lastModified: response.headers.get('last-modified')
        }
      })
    }
  } catch (error) {
    return {
      isTransient: true,
      result: Result.failure({
        code: 'download_failed',
        reason: String(error),
        url
      })
    }
  }
}

/**
 * Downloads an open-data zip unless the server says the cached copy is
 * current (conditional GET on `ETag` / `Last-Modified`). A network error, a
 * 429 or a 5xx is retried after each of `RETRY_DELAYS_MS`.
 */
export const downloadArchive = async (
  url: string,
  cached: SourceValidators | null
): Promise<Result<ArchiveDownload, IngestError>> => {
  let attempt = await attemptDownload(url, cached)
  for (const delayMs of RETRY_DELAYS_MS) {
    if (!attempt.isTransient) break
    await wait(delayMs)
    attempt = await attemptDownload(url, cached)
  }
  return attempt.result
}

/** Every `.json` file of a zip, decoded as UTF-8, in memory. */
export const unzipJsonFiles = (
  url: string,
  zip: Uint8Array
): Result<ArchiveFile[], IngestError> => {
  try {
    const entries = unzipSync(zip, {
      filter: (entry) => entry.name.endsWith('.json')
    })
    const decoder = new TextDecoder('utf-8', { fatal: true })
    return Result.success(
      Object.entries(entries).map(([path, bytes]) => ({
        path,
        text: decoder.decode(bytes)
      }))
    )
  } catch (error) {
    return Result.failure({ code: 'unzip_failed', reason: String(error), url })
  }
}

/** A downloaded text file decoded: UTF-8, or Latin-1 for La Poste's file. */
export const decodeTextFile = ({
  bytes,
  encoding,
  url
}: {
  bytes: Uint8Array
  encoding: 'latin1' | 'utf-8'
  url: string
}): Result<string, IngestError> => {
  try {
    return Result.success(
      new TextDecoder(encoding, { fatal: true }).decode(bytes)
    )
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path: url
    })
  }
}
