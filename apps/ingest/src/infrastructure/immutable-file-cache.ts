import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { Result } from '@adrienlcp/result'

import type { IngestError } from '@/domain/ingest-errors.ts'
import { downloadArchive } from '@/infrastructure/open-data-client.ts'

const isMissingFile = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT'

const cacheFailure = (path: string, error: unknown) =>
  Result.failure({
    code: 'cache_unavailable',
    path,
    reason: String(error)
  } satisfies IngestError)

/** The cached copy; `null` when the file was never downloaded. */
export const readCachedImmutableFile = async (
  cacheDir: string,
  fileName: string
): Promise<Result<Uint8Array | null, IngestError>> => {
  const path = join(cacheDir, fileName)
  try {
    return Result.success(new Uint8Array(await readFile(path)))
  } catch (error) {
    return isMissingFile(error)
      ? Result.success(null)
      : cacheFailure(path, error)
  }
}

/**
 * Downloads a file whose name changes whenever its content does, and keeps it
 * in the cache folder: it is never asked for again. `fileName` must be a bare
 * file name, checked by the caller.
 */
export const downloadImmutableFile = async ({
  cacheDir,
  fileName,
  url
}: {
  cacheDir: string
  fileName: string
  url: string
}): Promise<Result<Uint8Array, IngestError>> => {
  const download = await downloadArchive(url, null)
  if (download.status === 'failure') return download
  if (download.data.status === 'unchanged') {
    return Result.failure({
      code: 'download_failed',
      reason: 'HTTP 304 without a cached copy',
      url
    })
  }
  const path = join(cacheDir, fileName)
  try {
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path, download.data.bytes)
    return Result.success(download.data.bytes)
  } catch (error) {
    return cacheFailure(path, error)
  }
}
