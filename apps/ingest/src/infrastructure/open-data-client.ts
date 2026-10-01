import { Result } from '@adrienlcp/result'
import { unzipSync } from 'fflate'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type { SourceValidators } from '@/domain/source-version.ts'

const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000
const HTTP_NOT_MODIFIED = 304

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

/**
 * Downloads an open-data zip unless the server says the cached copy is
 * current (conditional GET on `ETag` / `Last-Modified`).
 */
export const downloadArchive = async (
  url: string,
  cached: SourceValidators | null
): Promise<Result<ArchiveDownload, IngestError>> => {
  try {
    const response = await fetch(url, {
      headers: conditionalHeaders(cached),
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS)
    })
    if (response.status === HTTP_NOT_MODIFIED) {
      return Result.success({ status: 'unchanged' })
    }
    if (!response.ok) {
      return Result.failure({
        code: 'download_failed',
        reason: `HTTP ${response.status}`,
        url
      })
    }
    return Result.success({
      bytes: new Uint8Array(await response.arrayBuffer()),
      status: 'downloaded',
      validators: {
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified')
      }
    })
  } catch (error) {
    return Result.failure({
      code: 'download_failed',
      reason: String(error),
      url
    })
  }
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
