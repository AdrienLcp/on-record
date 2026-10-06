import { Result } from '@adrienlcp/result'

import type { Deputy } from '@on-record/protocol/assembly/deputy.ts'
import type { DeputyId } from '@on-record/protocol/assembly/official-ids.ts'
import type {
  HatvpRecord,
  InterestsSummary
} from '@on-record/protocol/hatvp/hatvp-record.ts'
import type { SenatorId } from '@on-record/protocol/senate/senate-ids.ts'
import type { Senator } from '@on-record/protocol/senate/senator.ts'

import {
  type InterestsFile,
  latestInterestsFile,
  toDeclarations
} from '@/domain/hatvp/declarations.ts'
import type { HatvpPerson } from '@/domain/hatvp/hatvp-list.ts'
import { readHatvpList } from '@/domain/hatvp/hatvp-list.ts'
import {
  type ChamberMember,
  type HatvpMatchReport,
  matchHatvpPeople
} from '@/domain/hatvp/hatvp-matching.ts'
import { hatvpListSource, hatvpUrlOf } from '@/domain/hatvp/hatvp-sources.ts'
import { toInterestSections } from '@/domain/hatvp/interests-summary.ts'
import { rawInterestsDeclarationSchema } from '@/domain/hatvp/raw-interests-declaration.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import { checkRaw } from '@/domain/raw-parsing.ts'

/**
 * Reads one declaration XML by file name, already parsed. A `download_failed`
 * failure leaves the person without a summary; any other stops the run.
 */
export type InterestsFileReader = (
  fileName: string
) => Promise<Result<unknown, IngestError>>

export type HatvpDatasets = {
  deputyRecords: { deputyId: DeputyId; record: HatvpRecord }[]
  report: {
    declarations: number
    deputies: HatvpMatchReport
    interestsSummaries: number
    senators: HatvpMatchReport
    /** XML files that could not be downloaded this run: their person shows the list only. */
    unavailableInterestFiles: string[]
  }
  senatorRecords: { senatorId: SenatorId; record: HatvpRecord }[]
}

/** Files downloaded at once on a first run, when none is cached yet. */
const PARALLEL_DOWNLOADS = 8

const ASSEMBLY_ID_PREFIX = 'PA'

const toMember = (
  official: Deputy | Senator,
  originId: string
): ChamberMember => ({
  firstName: official.firstName,
  hatvpUrl: official.hatvpUrl,
  id: official.id,
  lastName: official.lastName,
  originId
})

const readSummaries = async (
  files: readonly InterestsFile[],
  readInterestsFile: InterestsFileReader
): Promise<
  Result<
    { summaries: Map<string, InterestsSummary>; unavailable: string[] },
    IngestError
  >
> => {
  const summaries = new Map<string, InterestsSummary>()
  const unavailable: string[] = []
  for (let start = 0; start < files.length; start += PARALLEL_DOWNLOADS) {
    const batch = files.slice(start, start + PARALLEL_DOWNLOADS)
    const documents = await Promise.all(
      batch.map((file) => readInterestsFile(file.dataFileName))
    )
    for (const [index, document] of documents.entries()) {
      const file = batch[index]
      if (file === undefined) continue
      if (document.status === 'failure') {
        if (document.error.code !== 'download_failed') return document
        unavailable.push(file.dataFileName)
        continue
      }
      const declaration = checkRaw(
        document.data,
        rawInterestsDeclarationSchema,
        file.dataFileName
      )
      if (declaration.status === 'failure') return declaration
      summaries.set(file.dataFileName, {
        filedOn: file.filedOn,
        kind: file.kind,
        pdfUrl: file.pdfUrl,
        sections: toInterestSections(declaration.data)
      })
    }
  }
  return Result.success({ summaries, unavailable })
}

const toRecord = ({
  fallbackPage,
  person,
  summaries
}: {
  fallbackPage: string | null
  person: HatvpPerson | undefined
  summaries: ReadonlyMap<string, InterestsSummary>
}): HatvpRecord => {
  if (person === undefined) {
    return { declarations: [], interests: null, page: fallbackPage }
  }
  const interestsFile = latestInterestsFile(person.rows)
  return {
    declarations: toDeclarations(person.rows),
    interests:
      interestsFile === null
        ? null
        : (summaries.get(interestsFile.dataFileName) ?? null),
    page: hatvpUrlOf(person.pagePath)
  }
}

/**
 * One HATVP record per deputy and per senator of the datasets. Those the list
 * does not hold (former members: the HATVP keeps the current mandate only)
 * get an empty record with the page their chamber links to.
 */
export const toHatvpDatasets = async ({
  deputies,
  listText,
  readInterestsFile,
  senators
}: {
  deputies: readonly Deputy[]
  listText: string
  readInterestsFile: InterestsFileReader
  senators: readonly Senator[]
}): Promise<Result<HatvpDatasets, IngestError>> => {
  const people = readHatvpList(listText, hatvpListSource.url)
  if (people.status === 'failure') return people

  const deputyMatches = matchHatvpPeople({
    members: deputies.map((deputy) =>
      toMember(deputy, deputy.id.slice(ASSEMBLY_ID_PREFIX.length))
    ),
    people: people.data.filter((person) => person.chamber === 'assembly')
  })
  const senatorMatches = matchHatvpPeople({
    members: senators.map((senator) => toMember(senator, senator.id)),
    people: people.data.filter((person) => person.chamber === 'senate')
  })
  const matchedPeople = [
    ...deputyMatches.matches.values(),
    ...senatorMatches.matches.values()
  ]
  const interestsFiles = matchedPeople.flatMap((person) => {
    const file = latestInterestsFile(person.rows)
    return file === null ? [] : [file]
  })
  const read = await readSummaries(interestsFiles, readInterestsFile)
  if (read.status === 'failure') return read
  const { summaries, unavailable } = read.data

  const deputyRecords = deputies.map((deputy) => ({
    deputyId: deputy.id,
    record: toRecord({
      fallbackPage: deputy.hatvpUrl,
      person: deputyMatches.matches.get(deputy.id),
      summaries
    })
  }))
  const senatorRecords = senators.map((senator) => ({
    record: toRecord({
      fallbackPage: senator.hatvpUrl,
      person: senatorMatches.matches.get(senator.id),
      summaries
    }),
    senatorId: senator.id
  }))
  const records = [...deputyRecords, ...senatorRecords].map(
    ({ record }) => record
  )

  return Result.success({
    deputyRecords,
    report: {
      declarations: records.reduce(
        (total, record) => total + record.declarations.length,
        0
      ),
      deputies: deputyMatches.report,
      interestsSummaries: records.filter((record) => record.interests !== null)
        .length,
      senators: senatorMatches.report,
      unavailableInterestFiles: unavailable
    },
    senatorRecords
  })
}
