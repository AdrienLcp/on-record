import { Result } from '@adrienlcp/result'

import type { DatasetsMeta, Source } from '@on-record/protocol/datasets.ts'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import { toAssemblyDatasets } from '@/domain/assembly-votes/assembly-datasets.ts'
import {
  assemblySources,
  currentDeputiesSource,
  deputiesHistorySource,
  LEGISLATURE,
  legislativeFilesSource,
  scrutinsSource
} from '@/domain/assembly-votes/assembly-sources.ts'
import {
  measureDatasetFiles,
  toDatasetFiles
} from '@/domain/assembly-votes/dataset-files.ts'
import {
  type ConstituencyArchives,
  type ConstituencyReport,
  toConstituencyDatasets
} from '@/domain/constituencies/constituency-datasets.ts'
import {
  communeMovesSource,
  communesSource,
  communeTableSource,
  constituencySources,
  contoursSource,
  overseasCommunesSource,
  postcodesSource
} from '@/domain/constituencies/constituency-sources.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type { OpenDataSource } from '@/domain/open-data-source.ts'
import {
  hasNoValidators,
  isNewerVersion,
  isSameContent
} from '@/domain/source-version.ts'
import { now } from '@/infrastructure/clock.ts'
import {
  hasPublishedDatasets,
  replaceDatasets
} from '@/infrastructure/dataset-writer.ts'
import { toIsoString } from '@/infrastructure/dates.ts'
import {
  readCachedArchive,
  readCachedValidators,
  writeCachedArchive
} from '@/infrastructure/download-cache.ts'
import {
  decodeTextFile,
  downloadArchive,
  unzipJsonFiles
} from '@/infrastructure/open-data-client.ts'
import { readFirstSheet } from '@/infrastructure/xlsx-reader.ts'

type SourceCheck = {
  hasChanged: boolean
  /** False when the publisher could not be reached and the cached copy stands in. */
  isReachable: boolean
  source: Source
}

export type IngestReport = {
  /** Ballots cast on a day none of the deputy's seat mandates covers. */
  ballotsOutsideMandates: number
  communes: ConstituencyReport
  counts: {
    communes: number
    deputies: number
    groups: number
    scrutins: number
    splitCommunes: number
  }
  durationMs: number
  /** Ballots listed under another group than the deputy's mandates give for that day. */
  listedGroupMismatches: number
  sizes: ReturnType<typeof measureDatasetFiles>
}

/** Which sources the server sent a new version of. */
export type SourceChanges = Record<string, boolean>

/** Ids of the sources whose publisher was down, read from the cached copy instead. */
export type UnreachableSources = string[]

export type IngestOutcome =
  | {
      sourceChanges: SourceChanges
      status: 'unchanged'
      unreachableSources: UnreachableSources
    }
  | {
      report: IngestReport
      sourceChanges: SourceChanges
      status: 'built'
      unreachableSources: UnreachableSources
    }

/** Every source of the datasets, in the order the sources page lists them. */
const ingestSources: readonly OpenDataSource[] = [
  ...assemblySources,
  ...constituencySources
]

/**
 * Whether a server with no validators sent the bytes already cached: insee.fr
 * answers every request with the whole file, changed or not.
 */
const isUnchangedContent = async (
  cacheDir: string,
  url: string,
  downloaded: Uint8Array
): Promise<Result<boolean, IngestError>> => {
  const cached = await readCachedArchive(cacheDir, url)
  if (cached.status === 'failure') return Result.success(false)
  return Result.success(isSameContent({ cached: cached.data, downloaded }))
}

/**
 * Brings the cached copy of a source up to date; says whether it changed. A
 * publisher that stays down keeps the cached copy: the site goes on serving
 * the last datasets rather than the run failing. Only a source never
 * downloaded fails the run.
 */
export const refreshSource = async (
  cacheDir: string,
  { id, url }: OpenDataSource
): Promise<Result<SourceCheck, IngestError>> => {
  const cached = await readCachedValidators(cacheDir, url)
  if (cached.status === 'failure') return cached
  const download = await downloadArchive(url, cached.data)
  const cachedSource = {
    id,
    lastModified: cached.data?.lastModified ?? null,
    url
  }
  if (download.status === 'failure') {
    if (cached.data === null) return download
    return Result.success({
      hasChanged: false,
      isReachable: false,
      source: cachedSource
    })
  }

  const unchanged = Result.success({
    hasChanged: false,
    isReachable: true,
    source: cachedSource
  })
  if (download.data.status === 'unchanged') return unchanged
  const { bytes, validators } = download.data
  if (!isNewerVersion({ cached: cached.data, downloaded: validators })) {
    return unchanged
  }
  if (cached.data !== null && hasNoValidators(validators)) {
    const isUnchanged = await isUnchangedContent(cacheDir, url, bytes)
    if (isUnchanged.status === 'failure') return isUnchanged
    if (isUnchanged.data) return unchanged
  }

  const written = await writeCachedArchive({ bytes, cacheDir, url, validators })
  if (written.status === 'failure') return written
  return Result.success({
    hasChanged: true,
    isReachable: true,
    source: { id, lastModified: validators.lastModified, url }
  })
}

const readArchive = async (
  cacheDir: string,
  { url }: OpenDataSource
): Promise<Result<ArchiveFile[], IngestError>> => {
  const zip = await readCachedArchive(cacheDir, url)
  if (zip.status === 'failure') return zip
  return unzipJsonFiles(url, zip.data)
}

const readText = async (
  cacheDir: string,
  { url }: OpenDataSource,
  encoding: 'latin1' | 'utf-8' = 'utf-8'
): Promise<Result<string, IngestError>> => {
  const bytes = await readCachedArchive(cacheDir, url)
  if (bytes.status === 'failure') return bytes
  return decodeTextFile({ bytes: bytes.data, encoding, url })
}

const readConstituencyArchives = async (
  cacheDir: string
): Promise<Result<ConstituencyArchives, IngestError>> => {
  const workbook = await readCachedArchive(cacheDir, communeTableSource.url)
  if (workbook.status === 'failure') return workbook
  const communeTableRows = readFirstSheet(communeTableSource.url, workbook.data)
  if (communeTableRows.status === 'failure') return communeTableRows
  const communes = await readText(cacheDir, communesSource)
  if (communes.status === 'failure') return communes
  const overseasCommunes = await readText(cacheDir, overseasCommunesSource)
  if (overseasCommunes.status === 'failure') return overseasCommunes
  const communeMoves = await readText(cacheDir, communeMovesSource)
  if (communeMoves.status === 'failure') return communeMoves
  const postcodes = await readText(cacheDir, postcodesSource, 'latin1')
  if (postcodes.status === 'failure') return postcodes
  const contours = await readText(cacheDir, contoursSource)
  if (contours.status === 'failure') return contours

  return Result.success({
    communeMoves: communeMoves.data,
    communes: communes.data,
    communeTableRows: communeTableRows.data,
    contours: contours.data,
    overseasCommunes: overseasCommunes.data,
    postcodes: postcodes.data
  })
}

/**
 * One ingest run: refresh every source, and unless none changed and datasets
 * already exist (or `force`), rebuild and replace every dataset.
 */
export const ingest = async ({
  cacheDir,
  dataDir,
  force
}: {
  cacheDir: string
  dataDir: string
  force: boolean
}): Promise<Result<IngestOutcome, IngestError>> => {
  const startedAt = now()
  const checks: SourceCheck[] = []
  for (const source of ingestSources) {
    const check = await refreshSource(cacheDir, source)
    if (check.status === 'failure') return check
    checks.push(check.data)
  }
  const sourceChanges = Object.fromEntries(
    checks.map((check) => [check.source.id, check.hasChanged])
  )
  const unreachableSources = checks
    .filter((check) => !check.isReachable)
    .map((check) => check.source.id)
  const hasAnySourceChanged = checks.some((check) => check.hasChanged)
  if (!hasAnySourceChanged && !force && hasPublishedDatasets(dataDir)) {
    return Result.success({
      sourceChanges,
      status: 'unchanged',
      unreachableSources
    })
  }

  const scrutins = await readArchive(cacheDir, scrutinsSource)
  if (scrutins.status === 'failure') return scrutins
  const currentDeputies = await readArchive(cacheDir, currentDeputiesSource)
  if (currentDeputies.status === 'failure') return currentDeputies
  const deputiesHistory = await readArchive(cacheDir, deputiesHistorySource)
  if (deputiesHistory.status === 'failure') return deputiesHistory
  const legislativeFiles = await readArchive(cacheDir, legislativeFilesSource)
  if (legislativeFiles.status === 'failure') return legislativeFiles
  const assembly = toAssemblyDatasets({
    currentDeputies: currentDeputies.data,
    deputiesHistory: deputiesHistory.data,
    legislativeFiles: legislativeFiles.data,
    scrutins: scrutins.data
  })
  if (assembly.status === 'failure') return assembly

  const constituencyArchives = await readConstituencyArchives(cacheDir)
  if (constituencyArchives.status === 'failure') return constituencyArchives
  const constituencies = toConstituencyDatasets(constituencyArchives.data)
  if (constituencies.status === 'failure') return constituencies

  const meta: DatasetsMeta = {
    generatedAt: toIsoString(now()),
    legislature: LEGISLATURE,
    sources: checks.map((check) => check.source)
  }
  const files = toDatasetFiles({
    assembly: assembly.data,
    constituencies: constituencies.data,
    meta
  })
  if (files.status === 'failure') return files
  const written = await replaceDatasets(dataDir, files.data)
  if (written.status === 'failure') return written

  return Result.success({
    report: {
      ballotsOutsideMandates: assembly.data.ballotsOutsideMandates,
      communes: constituencies.data.report,
      counts: {
        communes: constituencies.data.communes.length,
        deputies: assembly.data.deputies.length,
        groups: assembly.data.groups.length,
        scrutins: assembly.data.scrutins.length,
        splitCommunes: constituencies.data.report.splitCommunes
      },
      durationMs: Math.round(now().since(startedAt).total('milliseconds')),
      listedGroupMismatches: assembly.data.listedGroupMismatches,
      sizes: measureDatasetFiles(files.data)
    },
    sourceChanges,
    status: 'built',
    unreachableSources
  })
}
