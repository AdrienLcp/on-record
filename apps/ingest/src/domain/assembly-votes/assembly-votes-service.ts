import { Result } from '@adrienlcp/result'

import type { DatasetsMeta, Source } from '@on-record/protocol/datasets.ts'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import { isNewerArchive } from '@/domain/assembly-votes/archive-version.ts'
import { toAssemblyDatasets } from '@/domain/assembly-votes/assembly-datasets.ts'
import {
  type AssemblySource,
  assemblySources,
  currentDeputiesSource,
  deputiesHistorySource,
  LEGISLATURE,
  scrutinsSource
} from '@/domain/assembly-votes/assembly-sources.ts'
import type { AssemblyVotesError } from '@/domain/assembly-votes/assembly-votes-errors.ts'
import {
  measureDatasetFiles,
  toDatasetFiles
} from '@/domain/assembly-votes/dataset-files.ts'
import { now } from '@/infrastructure/clock.ts'
import {
  hasPublishedDatasets,
  replaceDatasets
} from '@/infrastructure/dataset-writer.ts'
import {
  readCachedArchive,
  readCachedValidators,
  writeCachedArchive
} from '@/infrastructure/download-cache.ts'
import {
  downloadArchive,
  unzipJsonFiles
} from '@/infrastructure/open-data-client.ts'

type SourceCheck = { hasChanged: boolean; source: Source }

export type AssemblyIngestReport = {
  durationMs: number
  /** Ballots listed under another group than the deputy's mandates give for that day. */
  listedGroupMismatches: number
  counts: { deputies: number; groups: number; scrutins: number }
  sizes: ReturnType<typeof measureDatasetFiles>
}

/** Which sources the server sent a new version of. */
export type SourceChanges = Record<string, boolean>

export type AssemblyIngestOutcome =
  | { sourceChanges: SourceChanges; status: 'unchanged' }
  | {
      report: AssemblyIngestReport
      sourceChanges: SourceChanges
      status: 'built'
    }

/** Brings the cached copy of a zip up to date; says whether it changed. */
const refreshSource = async (
  cacheDir: string,
  { id, url }: AssemblySource
): Promise<Result<SourceCheck, AssemblyVotesError>> => {
  const cached = await readCachedValidators(cacheDir, url)
  if (cached.status === 'failure') return cached
  const download = await downloadArchive(url, cached.data)
  if (download.status === 'failure') return download

  const unchanged = Result.success({
    hasChanged: false,
    source: { id, lastModified: cached.data?.lastModified ?? null, url }
  })
  if (download.data.status === 'unchanged') return unchanged
  const { bytes, validators } = download.data
  if (!isNewerArchive({ cached: cached.data, downloaded: validators })) {
    return unchanged
  }

  const written = await writeCachedArchive({ bytes, cacheDir, url, validators })
  if (written.status === 'failure') return written
  return Result.success({
    hasChanged: true,
    source: { id, lastModified: validators.lastModified, url }
  })
}

const readArchive = async (
  cacheDir: string,
  { url }: AssemblySource
): Promise<Result<ArchiveFile[], AssemblyVotesError>> => {
  const zip = await readCachedArchive(cacheDir, url)
  if (zip.status === 'failure') return zip
  return unzipJsonFiles(url, zip.data)
}

/**
 * One ingest run: refresh the three zips, and unless none changed and
 * datasets already exist (or `force`), rebuild and replace every Assembly
 * dataset.
 */
export const ingestAssemblyVotes = async ({
  cacheDir,
  dataDir,
  force
}: {
  cacheDir: string
  dataDir: string
  force: boolean
}): Promise<Result<AssemblyIngestOutcome, AssemblyVotesError>> => {
  const startedAt = now()
  const checks: SourceCheck[] = []
  for (const source of assemblySources) {
    const check = await refreshSource(cacheDir, source)
    if (check.status === 'failure') return check
    checks.push(check.data)
  }
  const sourceChanges = Object.fromEntries(
    checks.map((check) => [check.source.id, check.hasChanged])
  )
  const hasAnySourceChanged = checks.some((check) => check.hasChanged)
  if (!hasAnySourceChanged && !force && hasPublishedDatasets(dataDir)) {
    return Result.success({ sourceChanges, status: 'unchanged' })
  }

  const scrutins = await readArchive(cacheDir, scrutinsSource)
  if (scrutins.status === 'failure') return scrutins
  const currentDeputies = await readArchive(cacheDir, currentDeputiesSource)
  if (currentDeputies.status === 'failure') return currentDeputies
  const deputiesHistory = await readArchive(cacheDir, deputiesHistorySource)
  if (deputiesHistory.status === 'failure') return deputiesHistory

  const datasets = toAssemblyDatasets({
    currentDeputies: currentDeputies.data,
    deputiesHistory: deputiesHistory.data,
    scrutins: scrutins.data
  })
  if (datasets.status === 'failure') return datasets

  const meta: DatasetsMeta = {
    generatedAt: now().toISOString(),
    legislature: LEGISLATURE,
    sources: checks.map((check) => check.source)
  }
  const files = toDatasetFiles({ datasets: datasets.data, meta })
  if (files.status === 'failure') return files
  const written = await replaceDatasets(dataDir, files.data)
  if (written.status === 'failure') return written

  return Result.success({
    report: {
      counts: {
        deputies: datasets.data.deputies.length,
        groups: datasets.data.groups.length,
        scrutins: datasets.data.scrutins.length
      },
      durationMs: now().getTime() - startedAt.getTime(),
      listedGroupMismatches: datasets.data.listedGroupMismatches,
      sizes: measureDatasetFiles(files.data)
    },
    sourceChanges,
    status: 'built'
  })
}
