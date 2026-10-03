import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { Deputy } from '@on-record/protocol/assembly/deputy.ts'
import { compareDeputyNames } from '@on-record/protocol/assembly/deputy-name-order.ts'
import type { DeputyRecord } from '@on-record/protocol/assembly/deputy-record.ts'
import type { Group } from '@on-record/protocol/assembly/group.ts'
import type { GroupRecord } from '@on-record/protocol/assembly/group-record.ts'
import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids.ts'
import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import { toDeputy } from '@/domain/assembly-votes/deputy.ts'
import { toDeputyRecords } from '@/domain/assembly-votes/deputy-records.ts'
import { toGroup } from '@/domain/assembly-votes/group.ts'
import { groupAtDate } from '@/domain/assembly-votes/group-at-date.ts'
import { toGroupRecords } from '@/domain/assembly-votes/group-records.ts'
import { withLegislativeFiles } from '@/domain/assembly-votes/legislative-file-links.ts'
import { resolvePlaceholderGroups } from '@/domain/assembly-votes/placeholder-group.ts'
import {
  isLegislatureDeputyFile,
  type RawDeputy,
  rawDeputyFileSchema
} from '@/domain/assembly-votes/raw-actor.ts'
import {
  type RawLegislativeFile,
  rawLegislativeFileSchema
} from '@/domain/assembly-votes/raw-legislative-file.ts'
import {
  isLegislatureGroupFile,
  type RawGroup,
  rawGroupFileSchema
} from '@/domain/assembly-votes/raw-organ.ts'
import { rawScrutinFileSchema } from '@/domain/assembly-votes/raw-scrutin.ts'
import { toScrutinDetail } from '@/domain/assembly-votes/scrutin-detail.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

const ACTOR_FOLDER = '/acteur/'
const ORGAN_FOLDER = '/organe/'
/** The legislative files zip also holds every document of those files, unread here. */
const LEGISLATIVE_FILE_FOLDER = '/dossierParlementaire/'

/** The unzipped JSON files of the four Assembly zips. */
export type AssemblyArchives = {
  currentDeputies: readonly ArchiveFile[]
  deputiesHistory: readonly ArchiveFile[]
  legislativeFiles: readonly ArchiveFile[]
  scrutins: readonly ArchiveFile[]
}

export type AssemblyDatasets = {
  deputies: Deputy[]
  deputyRecords: DeputyRecord[]
  groupRecords: GroupRecord[]
  groups: Group[]
  /** Ballots cast on a day none of the deputy's seat mandates covers: `0` when mandates are complete. */
  ballotsOutsideMandates: number
  /** Ballots listed under another group than the deputy's mandates give for that day. */
  listedGroupMismatches: number
  scrutins: ScrutinDetail[]
}

const parseJson = (file: ArchiveFile): Result<unknown, IngestError> => {
  try {
    const json: unknown = JSON.parse(file.text)
    return Result.success(json)
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path: file.path
    })
  }
}

const parseWith = <Schema extends z.ZodType>(
  schema: Schema,
  file: ArchiveFile,
  json: unknown
): Result<z.output<Schema>, IngestError> => {
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: z.prettifyError(parsed.error),
      path: file.path
    })
  }
  return Result.success(parsed.data)
}

/**
 * Files of both actor zips, the history first: AMO10 keeps only the mandates
 * still running, so a sitting deputy's past groups are in AMO30 alone. AMO10
 * only fills in an actor the history does not hold yet.
 */
const historyFirstFiles = (archives: AssemblyArchives, folder: string) => [
  ...archives.deputiesHistory.filter((file) => file.path.includes(folder)),
  ...archives.currentDeputies.filter((file) => file.path.includes(folder))
]

const readDeputies = (
  archives: AssemblyArchives
): Result<RawDeputy[], IngestError> => {
  const deputiesById = new Map<DeputyId, RawDeputy>()
  for (const file of historyFirstFiles(archives, ACTOR_FOLDER)) {
    const json = parseJson(file)
    if (json.status === 'failure') return json
    if (!isLegislatureDeputyFile(json.data)) continue
    const deputy = parseWith(rawDeputyFileSchema, file, json.data)
    if (deputy.status === 'failure') return deputy
    const id = deputy.data.acteur.uid['#text']
    if (!deputiesById.has(id)) deputiesById.set(id, deputy.data.acteur)
  }
  return Result.success([...deputiesById.values()])
}

const readGroups = (
  archives: AssemblyArchives
): Result<RawGroup[], IngestError> => {
  const groupsById = new Map<OrganId, RawGroup>()
  for (const file of historyFirstFiles(archives, ORGAN_FOLDER)) {
    const json = parseJson(file)
    if (json.status === 'failure') return json
    if (!isLegislatureGroupFile(json.data)) continue
    const group = parseWith(rawGroupFileSchema, file, json.data)
    if (group.status === 'failure') return group
    if (!groupsById.has(group.data.organe.uid)) {
      groupsById.set(group.data.organe.uid, group.data.organe)
    }
  }
  return Result.success([...groupsById.values()])
}

const readScrutins = (
  archives: AssemblyArchives
): Result<ScrutinDetail[], IngestError> => {
  const scrutins: ScrutinDetail[] = []
  for (const file of archives.scrutins) {
    const json = parseJson(file)
    if (json.status === 'failure') return json
    const scrutin = parseWith(rawScrutinFileSchema, file, json.data)
    if (scrutin.status === 'failure') return scrutin
    scrutins.push(toScrutinDetail(scrutin.data.scrutin))
  }
  return Result.success(
    scrutins.toSorted((left, right) => left.number - right.number)
  )
}

const readLegislativeFiles = (
  archives: AssemblyArchives
): Result<RawLegislativeFile[], IngestError> => {
  const files: RawLegislativeFile[] = []
  for (const file of archives.legislativeFiles) {
    if (!file.path.includes(LEGISLATIVE_FILE_FOLDER)) continue
    const json = parseJson(file)
    if (json.status === 'failure') return json
    const legislativeFile = parseWith(rawLegislativeFileSchema, file, json.data)
    if (legislativeFile.status === 'failure') return legislativeFile
    files.push(legislativeFile.data.dossierParlementaire)
  }
  return Result.success(files)
}

const toDeputies = (
  rawDeputies: readonly RawDeputy[]
): Result<Deputy[], IngestError> => {
  const deputies: Deputy[] = []
  for (const rawDeputy of rawDeputies) {
    const deputy = toDeputy(rawDeputy)
    if (deputy.status === 'failure') return deputy
    deputies.push(deputy.data)
  }
  return Result.success(
    deputies.toSorted(
      (left, right) =>
        compareDeputyNames(left, right) || left.id.localeCompare(right.id)
    )
  )
}

const findUnknownGroup = ({
  deputies,
  groups,
  scrutins
}: {
  deputies: readonly Deputy[]
  groups: readonly Group[]
  scrutins: readonly ScrutinDetail[]
}): OrganId | null => {
  const knownGroupIds = new Set(groups.map((group) => group.id))
  const referencedGroupIds = [
    ...deputies.flatMap((deputy) =>
      deputy.groups.map((spell) => spell.groupId)
    ),
    ...scrutins.flatMap((scrutin) =>
      scrutin.groups.map((group) => group.groupId)
    )
  ]
  return (
    referencedGroupIds.find((groupId) => !knownGroupIds.has(groupId)) ?? null
  )
}

type MembershipsById = ReadonlyMap<DeputyId, Deputy['groups']>

const toMembershipsById = (deputies: readonly Deputy[]): MembershipsById =>
  new Map(deputies.map((deputy) => [deputy.id, deputy.groups]))

const resolveScrutinGroups = (
  scrutins: readonly ScrutinDetail[],
  membershipsById: MembershipsById
): Result<ScrutinDetail[], IngestError> => {
  const resolved: ScrutinDetail[] = []
  for (const scrutin of scrutins) {
    const resolvedScrutin = resolvePlaceholderGroups(scrutin, membershipsById)
    if (resolvedScrutin.status === 'failure') return resolvedScrutin
    resolved.push(resolvedScrutin.data)
  }
  return Result.success(resolved)
}

const countListedGroupMismatches = (
  scrutins: readonly ScrutinDetail[],
  membershipsById: MembershipsById
): number =>
  scrutins.flatMap((scrutin) =>
    scrutin.groups.flatMap((group) =>
      group.ballots.filter(
        (ballot) =>
          groupAtDate(
            membershipsById.get(ballot.deputyId) ?? [],
            scrutin.date
          ) !== group.groupId
      )
    )
  ).length

const countBallotsOutsideMandates = (
  scrutins: readonly ScrutinDetail[],
  deputies: readonly Deputy[]
): number => {
  const mandatesById = new Map(
    deputies.map((deputy) => [deputy.id, deputy.mandates])
  )
  return scrutins.flatMap((scrutin) =>
    scrutin.groups.flatMap((group) =>
      group.ballots.filter(
        (ballot) =>
          !(mandatesById.get(ballot.deputyId) ?? []).some(
            (mandate) =>
              mandate.from <= scrutin.date &&
              (mandate.to === null || scrutin.date <= mandate.to)
          )
      )
    )
  ).length
}

/** The four unzipped Assembly archives → every Assembly dataset, checked for dangling references. */
export const toAssemblyDatasets = (
  archives: AssemblyArchives
): Result<AssemblyDatasets, IngestError> => {
  const rawDeputies = readDeputies(archives)
  if (rawDeputies.status === 'failure') return rawDeputies
  const rawGroups = readGroups(archives)
  if (rawGroups.status === 'failure') return rawGroups
  const rawScrutins = readScrutins(archives)
  if (rawScrutins.status === 'failure') return rawScrutins
  const legislativeFiles = readLegislativeFiles(archives)
  if (legislativeFiles.status === 'failure') return legislativeFiles
  const linkedScrutins = withLegislativeFiles({
    files: legislativeFiles.data,
    scrutins: rawScrutins.data
  })
  const deputies = toDeputies(rawDeputies.data)
  if (deputies.status === 'failure') return deputies
  const membershipsById = toMembershipsById(deputies.data)
  const scrutins = resolveScrutinGroups(linkedScrutins, membershipsById)
  if (scrutins.status === 'failure') return scrutins

  const groups = rawGroups.data
    .map(toGroup)
    .toSorted(
      (left, right) =>
        left.from.localeCompare(right.from) || left.id.localeCompare(right.id)
    )
  const unknownGroupId = findUnknownGroup({
    deputies: deputies.data,
    groups,
    scrutins: scrutins.data
  })
  if (unknownGroupId !== null) {
    return Result.failure({ code: 'unknown_group', groupId: unknownGroupId })
  }

  const deputyRecords = toDeputyRecords({
    deputyIds: deputies.data.map((deputy) => deputy.id),
    scrutins: scrutins.data
  })
  if (deputyRecords.status === 'failure') return deputyRecords

  const groupRecords = toGroupRecords({
    groupIds: groups.map((group) => group.id),
    scrutins: scrutins.data
  })
  if (groupRecords.status === 'failure') return groupRecords

  return Result.success({
    ballotsOutsideMandates: countBallotsOutsideMandates(
      scrutins.data,
      deputies.data
    ),
    deputies: deputies.data,
    deputyRecords: deputyRecords.data,
    groupRecords: groupRecords.data,
    groups,
    listedGroupMismatches: countListedGroupMismatches(
      scrutins.data,
      membershipsById
    ),
    scrutins: scrutins.data
  })
}
