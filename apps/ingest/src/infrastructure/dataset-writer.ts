import { existsSync } from 'node:fs'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import { Result } from '@adrienlcp/result'

import { datasetPaths } from '@on-record/protocol/datasets.ts'

import type { AssemblyVotesError } from '@/domain/assembly-votes/assembly-votes-errors.ts'
import type { DatasetFile } from '@/domain/assembly-votes/dataset-files.ts'

/** Whether a previous run left a complete set of datasets (`meta.json` is written with them). */
export const hasPublishedDatasets = (dataDir: string): boolean =>
  existsSync(join(dataDir, datasetPaths.meta))

/**
 * Replaces the whole datasets folder: files are written to a staging folder
 * first, so a failed run leaves the previous datasets in place and a deputy
 * gone from the sources leaves no stale file behind.
 */
export const replaceDatasets = async (
  dataDir: string,
  files: readonly DatasetFile[]
): Promise<Result<void, AssemblyVotesError>> => {
  const stagingDir = `${dataDir}.staging`
  try {
    await rm(stagingDir, { force: true, recursive: true })
    const folders = new Set(
      files.map((file) => dirname(join(stagingDir, file.path)))
    )
    await Promise.all(
      [...folders].map((folder) => mkdir(folder, { recursive: true }))
    )
    await Promise.all(
      files.map((file) => writeFile(join(stagingDir, file.path), file.content))
    )
    await rm(dataDir, { force: true, recursive: true })
    await rename(stagingDir, dataDir)
    return Result.success()
  } catch (error) {
    return Result.failure({
      code: 'write_failed',
      path: dataDir,
      reason: String(error)
    })
  }
}
