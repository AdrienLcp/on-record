import { Result } from '@adrienlcp/result'
import { unzipSync } from 'fflate'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import type { ArchiveValidators } from '@/domain/assembly-votes/archive-version.ts'
import type { AssemblyVotesError } from '@/domain/assembly-votes/assembly-votes-errors.ts'

const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000
const HTTP_NOT_MODIFIED = 304

export type ArchiveDownload =
  | { status: 'unchanged' }
  | { bytes: Uint8Array; status: 'downloaded'; validators: ArchiveValidators }

const conditionalHeaders = (
  validators: ArchiveValidators | null
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
  cached: ArchiveValidators | null
): Promise<Result<ArchiveDownload, AssemblyVotesError>> => {
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
): Result<ArchiveFile[], AssemblyVotesError> => {
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
