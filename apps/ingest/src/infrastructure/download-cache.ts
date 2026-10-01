import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { IngestError } from '@/domain/ingest-errors.ts'
import type { SourceValidators } from '@/domain/source-version.ts'

const validatorsSchema = z.object({
  etag: z.string().nullable(),
  lastModified: z.string().nullable()
})

const archivePath = (cacheDir: string, url: string): string =>
  join(cacheDir, basename(new URL(url).pathname))

/** Written after the zip, so validators on disk always describe a complete zip. */
const validatorsPath = (cacheDir: string, url: string): string =>
  `${archivePath(cacheDir, url)}.validators.json`

const isMissingFile = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT'

const cacheFailure = (path: string, error: unknown) =>
  Result.failure({
    code: 'cache_unavailable',
    path,
    reason: String(error)
  } satisfies IngestError)

/** The validators of the cached copy of a zip; `null` when nothing is cached. */
export const readCachedValidators = async (
  cacheDir: string,
  url: string
): Promise<Result<SourceValidators | null, IngestError>> => {
  const path = validatorsPath(cacheDir, url)
  try {
    const validators = validatorsSchema.safeParse(
      JSON.parse(await readFile(path, 'utf-8'))
    )
    return Result.success(validators.success ? validators.data : null)
  } catch (error) {
    return isMissingFile(error)
      ? Result.success(null)
      : cacheFailure(path, error)
  }
}

export const readCachedArchive = async (
  cacheDir: string,
  url: string
): Promise<Result<Uint8Array, IngestError>> => {
  const path = archivePath(cacheDir, url)
  try {
    return Result.success(new Uint8Array(await readFile(path)))
  } catch (error) {
    return cacheFailure(path, error)
  }
}

export const writeCachedArchive = async ({
  bytes,
  cacheDir,
  url,
  validators
}: {
  bytes: Uint8Array
  cacheDir: string
  url: string
  validators: SourceValidators
}): Promise<Result<void, IngestError>> => {
  const path = archivePath(cacheDir, url)
  try {
    await mkdir(cacheDir, { recursive: true })
    await writeFile(path, bytes)
    await writeFile(validatorsPath(cacheDir, url), JSON.stringify(validators))
    return Result.success()
  } catch (error) {
    return cacheFailure(path, error)
  }
}
