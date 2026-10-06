import { join } from 'node:path'

import { Result } from '@adrienlcp/result'

import type { DatasetsMeta, Source } from '@on-record/protocol/datasets.ts'

import {
  type AmendmentDatasets,
  type AmendmentEntry,
  readAmendmentFile,
  toAmendmentDatasets
} from '@/domain/assembly-amendments/amendment-datasets.ts'
import { amendmentsSource } from '@/domain/assembly-amendments/amendments-source.ts'
import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import {
  type AssemblyDatasets,
  toAssemblyDatasets
} from '@/domain/assembly-votes/assembly-datasets.ts'
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
import {
  type HatvpDatasets,
  type InterestsFileReader,
  toHatvpDatasets
} from '@/domain/hatvp/hatvp-datasets.ts'
import {
  declarationFileUrl,
  hatvpListSource
} from '@/domain/hatvp/hatvp-sources.ts'
import { isDeclaredItemList } from '@/domain/hatvp/raw-interests-declaration.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import type { OpenDataSource } from '@/domain/open-data-source.ts'
import {
  type SenateDatasets,
  toSenateDatasets
} from '@/domain/senate-votes/senate-datasets.ts'
import {
  doslegSource,
  senateSources,
  senatorsSource
} from '@/domain/senate-votes/senate-sources.ts'
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
  downloadImmutableFile,
  readCachedImmutableFile
} from '@/infrastructure/immutable-file-cache.ts'
import {
  decodeTextFile,
  downloadArchive,
  unzipJsonFiles,
  unzipSingleTextFile,
  visitJsonFiles
} from '@/infrastructure/open-data-client.ts'
import { readFirstSheet } from '@/infrastructure/xlsx-reader.ts'
import { readXml } from '@/infrastructure/xml-reader.ts'

type SourceCheck = {
  hasChanged: boolean
  /** False when the publisher could not be reached and the cached copy stands in. */
  isReachable: boolean
  source: Source
}

export type IngestReport = {
  amendments: AmendmentDatasets['report']
  /** Ballots cast on a day none of the deputy's seat mandates covers. */
  ballotsOutsideMandates: number
  communes: ConstituencyReport
  counts: {
    communes: number
    deputies: number
    groups: number
    scrutins: number
    senateScrutins: number
    senators: number
    splitCommunes: number
  }
  durationMs: number
  hatvp: HatvpDatasets['report']
  /** Ballots listed under another group than the deputy's mandates give for that day. */
  listedGroupMismatches: number
  senate: SenateDatasets['report'] & { missingScrutins: number }
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
  amendmentsSource,
  ...senateSources,
  hatvpListSource,
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

/**
 * The amendments zip, read one file at a time: its 868 MB of JSON would not
 * fit in memory at once.
 */
const readAmendments = async (
  cacheDir: string,
  assembly: AssemblyDatasets
): Promise<Result<AmendmentDatasets, IngestError>> => {
  const zip = await readCachedArchive(cacheDir, amendmentsSource.url)
  if (zip.status === 'failure') return zip
  const entries: AmendmentEntry[] = []
  const visited = visitJsonFiles(amendmentsSource.url, zip.data, (file) => {
    const entry = readAmendmentFile(file)
    if (entry.status === 'failure') return entry
    entries.push(entry.data)
    return Result.success()
  })
  if (visited.status === 'failure') return visited
  return Result.success(
    toAmendmentDatasets({
      deputyIds: assembly.deputies.map((deputy) => deputy.id),
      entries,
      legislativeFileTitles: assembly.legislativeFileTitles,
      scrutins: assembly.scrutins.map((scrutin) => ({
        number: scrutin.number,
        outcome: scrutin.outcome,
        sittingId: assembly.scrutinSittings.get(scrutin.number) ?? null,
        title: scrutin.title
      }))
    })
  )
}

/** The `.sql` dump a Senate zip holds. */
const readDump = async (
  cacheDir: string,
  { url }: OpenDataSource
): Promise<Result<string, IngestError>> => {
  const zip = await readCachedArchive(cacheDir, url)
  if (zip.status === 'failure') return zip
  return unzipSingleTextFile({ extension: '.sql', url, zip: zip.data })
}

const readSenate = async (
  cacheDir: string
): Promise<Result<SenateDatasets, IngestError>> => {
  const doslegDump = await readDump(cacheDir, doslegSource)
  if (doslegDump.status === 'failure') return doslegDump
  const senatorsDump = await readDump(cacheDir, senatorsSource)
  if (senatorsDump.status === 'failure') return senatorsDump
  return toSenateDatasets({
    doslegDump: doslegDump.data,
    senatorsDump: senatorsDump.data
  })
}

/** Where the declaration XMLs are kept, beside the other downloads. */
const HATVP_DECLARATIONS_DIR = 'hatvp-declarations'

/** A refusal (404…) concerns one file; anything else means the publisher is not answering. */
const isPublisherFailure = (error: IngestError): boolean =>
  error.code === 'download_failed' && !error.reason.startsWith('HTTP 4')

/**
 * Reads declaration XMLs from the cache, downloading the ones never seen.
 * Once the publisher fails to answer, the rest are not asked for this run:
 * each attempt would wait through every retry.
 */
const createInterestsFileReader = (cacheDir: string): InterestsFileReader => {
  const declarationsDir = join(cacheDir, HATVP_DECLARATIONS_DIR)
  let isPublisherDown = false
  return async (fileName) => {
    const url = declarationFileUrl(fileName)
    const cached = await readCachedImmutableFile(declarationsDir, fileName)
    if (cached.status === 'failure') return cached
    let bytes = cached.data
    if (bytes === null) {
      if (isPublisherDown) {
        return Result.failure({
          code: 'download_failed',
          reason: 'publisher unreachable earlier in the run',
          url
        })
      }
      const downloaded = await downloadImmutableFile({
        cacheDir: declarationsDir,
        fileName,
        url
      })
      if (downloaded.status === 'failure') {
        if (isPublisherFailure(downloaded.error)) isPublisherDown = true
        return downloaded
      }
      bytes = downloaded.data
    }
    const text = decodeTextFile({ bytes, encoding: 'utf-8', url })
    if (text.status === 'failure') return text
    return readXml({ isList: isDeclaredItemList, path: url, text: text.data })
  }
}

const readHatvp = async ({
  assembly,
  cacheDir,
  senate
}: {
  assembly: AssemblyDatasets
  cacheDir: string
  senate: SenateDatasets
}): Promise<Result<HatvpDatasets, IngestError>> => {
  const listText = await readText(cacheDir, hatvpListSource)
  if (listText.status === 'failure') return listText
  return toHatvpDatasets({
    deputies: assembly.deputies,
    listText: listText.data,
    readInterestsFile: createInterestsFileReader(cacheDir),
    senators: senate.senators
  })
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
  const amendments = await readAmendments(cacheDir, assembly.data)
  if (amendments.status === 'failure') return amendments
  const senate = await readSenate(cacheDir)
  if (senate.status === 'failure') return senate
  const hatvp = await readHatvp({
    assembly: assembly.data,
    cacheDir,
    senate: senate.data
  })
  if (hatvp.status === 'failure') return hatvp

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
    amendments: amendments.data,
    assembly: assembly.data,
    constituencies: constituencies.data,
    hatvp: hatvp.data,
    meta,
    senate: senate.data
  })
  if (files.status === 'failure') return files
  const written = await replaceDatasets(dataDir, files.data)
  if (written.status === 'failure') return written

  return Result.success({
    report: {
      amendments: amendments.data.report,
      ballotsOutsideMandates: assembly.data.ballotsOutsideMandates,
      communes: constituencies.data.report,
      counts: {
        communes: constituencies.data.communes.length,
        deputies: assembly.data.deputies.length,
        groups: assembly.data.groups.length,
        scrutins: assembly.data.scrutins.length,
        senateScrutins: senate.data.scrutins.length,
        senators: senate.data.senators.length,
        splitCommunes: constituencies.data.report.splitCommunes
      },
      durationMs: Math.round(now().since(startedAt).total('milliseconds')),
      hatvp: hatvp.data.report,
      listedGroupMismatches: assembly.data.listedGroupMismatches,
      senate: {
        ...senate.data.report,
        missingScrutins: senate.data.missing.length
      },
      sizes: measureDatasetFiles(files.data)
    },
    sourceChanges,
    status: 'built',
    unreachableSources
  })
}
