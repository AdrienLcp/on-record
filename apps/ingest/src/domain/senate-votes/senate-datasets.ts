import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { SenateGroup } from '@on-record/protocol/senate/senate-group.ts'
import type {
  MissingSenateScrutin,
  SenateScrutinDetail
} from '@on-record/protocol/senate/senate-scrutin.ts'
import type {
  SenateGroupMembership,
  Senator
} from '@on-record/protocol/senate/senator.ts'
import type { SenatorRecord } from '@on-record/protocol/senate/senator-record.ts'

import { groupAtDate } from '@/domain/assembly-votes/group-at-date.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import { checkRaw } from '@/domain/raw-parsing.ts'
import { findMissingSenateScrutins } from '@/domain/senate-votes/missing-senate-scrutins.ts'
import {
  type RawSenatorBallotRow,
  rawBillRowSchema,
  rawChamberReadingRowSchema,
  rawConstituencyRowSchema,
  rawCorrectionRowSchema,
  rawGroupMembershipRowSchema,
  rawGroupRowSchema,
  rawReadingRowSchema,
  rawScrutinRowSchema,
  rawSeatRowSchema,
  rawSenatorBallotRowSchema,
  rawSenatorRowSchema,
  rawSittingRowSchema
} from '@/domain/senate-votes/raw-senate-rows.ts'
import { toSenateCorrections } from '@/domain/senate-votes/senate-corrections.ts'
import { legislativeFileFinder } from '@/domain/senate-votes/senate-legislative-files.ts'
import {
  isFlaggedForCorrection,
  toSenateScrutin
} from '@/domain/senate-votes/senate-scrutins.ts'
import {
  doslegSource,
  FIRST_SENATE_SESSION,
  senatorsSource
} from '@/domain/senate-votes/senate-sources.ts'
import {
  newestSenateScrutinFirst,
  toSenatorRecords
} from '@/domain/senate-votes/senator-records.ts'
import { toSenators } from '@/domain/senate-votes/senators.ts'
import {
  type DumpRow,
  readDumpTables
} from '@/infrastructure/pg-dump-reader.ts'

export type SenateDatasets = {
  groups: SenateGroup[]
  missing: MissingSenateScrutin[]
  report: {
    /** Flagged "mises au point" no sentence of the official report could be tied to. */
    /** Corrections naming the position the ballot already holds, left out. */
    unchangedCorrections: number
    unmatchedCorrections: number
  }
  /** Newest first. */
  scrutins: SenateScrutinDetail[]
  senatorRecords: SenatorRecord[]
  senators: Senator[]
}

/** The first sitting of the first covered session: those who left the day before never voted in it. */
const FIRST_COVERED_DAY = `${FIRST_SENATE_SESSION}-10-02`

const isCoveredSession = (row: DumpRow): boolean =>
  Number(row.sesann) >= FIRST_SENATE_SESSION

const scrutinKey = (row: { scrnum: number; sesann: number }): string =>
  `${row.sesann}-${row.scrnum}`

const groupBy = <Row>(
  rows: readonly Row[],
  keyOf: (row: Row) => string
): Map<string, Row[]> => {
  const groups = new Map<string, Row[]>()
  for (const row of rows) {
    const key = keyOf(row)
    const group = groups.get(key)
    if (group === undefined) groups.set(key, [row])
    else group.push(row)
  }
  return groups
}

const tableOf = <Schema extends z.ZodType>({
  name,
  path,
  schema,
  tables
}: {
  name: string
  path: string
  schema: Schema
  tables: ReadonlyMap<string, DumpRow[]>
}): Result<z.output<Schema>[], IngestError> =>
  checkRaw(tables.get(name) ?? [], z.array(schema), `${path}#${name}`)

/**
 * The Senate's scrutins, senators and groups, from its two dumps. Only the
 * sessions since `FIRST_SENATE_SESSION` are kept, and the senators who held a
 * seat in them.
 */
export const toSenateDatasets = ({
  doslegDump,
  senatorsDump
}: {
  doslegDump: string
  senatorsDump: string
}): Result<SenateDatasets, IngestError> => {
  const dosleg = readDumpTables({
    path: doslegSource.url,
    selection: {
      corscr: isCoveredSession,
      date_seance: null,
      lecass: null,
      lecture: null,
      loi: null,
      scr: isCoveredSession,
      votsen: isCoveredSession
    },
    text: doslegDump
  })
  if (dosleg.status === 'failure') return dosleg
  const people = readDumpTables({
    path: senatorsSource.url,
    selection: {
      dpt: null,
      elusen: null,
      grppol: null,
      memgrppol: null,
      sen: null
    },
    text: senatorsDump
  })
  if (people.status === 'failure') return people

  const fromDosleg = { path: doslegSource.url, tables: dosleg.data }
  const fromPeople = { path: senatorsSource.url, tables: people.data }
  const scrutinRows = tableOf({
    ...fromDosleg,
    name: 'scr',
    schema: rawScrutinRowSchema
  })
  if (scrutinRows.status === 'failure') return scrutinRows
  const ballotRows = tableOf({
    ...fromDosleg,
    name: 'votsen',
    schema: rawSenatorBallotRowSchema
  })
  if (ballotRows.status === 'failure') return ballotRows
  const correctionRows = tableOf({
    ...fromDosleg,
    name: 'corscr',
    schema: rawCorrectionRowSchema
  })
  if (correctionRows.status === 'failure') return correctionRows
  const sittings = tableOf({
    ...fromDosleg,
    name: 'date_seance',
    schema: rawSittingRowSchema
  })
  if (sittings.status === 'failure') return sittings
  const chamberReadings = tableOf({
    ...fromDosleg,
    name: 'lecass',
    schema: rawChamberReadingRowSchema
  })
  if (chamberReadings.status === 'failure') return chamberReadings
  const readings = tableOf({
    ...fromDosleg,
    name: 'lecture',
    schema: rawReadingRowSchema
  })
  if (readings.status === 'failure') return readings
  const bills = tableOf({
    ...fromDosleg,
    name: 'loi',
    schema: rawBillRowSchema
  })
  if (bills.status === 'failure') return bills
  const senatorRows = tableOf({
    ...fromPeople,
    name: 'sen',
    schema: rawSenatorRowSchema
  })
  if (senatorRows.status === 'failure') return senatorRows
  const seats = tableOf({
    ...fromPeople,
    name: 'elusen',
    schema: rawSeatRowSchema
  })
  if (seats.status === 'failure') return seats
  const memberships = tableOf({
    ...fromPeople,
    name: 'memgrppol',
    schema: rawGroupMembershipRowSchema
  })
  if (memberships.status === 'failure') return memberships
  const groupRows = tableOf({
    ...fromPeople,
    name: 'grppol',
    schema: rawGroupRowSchema
  })
  if (groupRows.status === 'failure') return groupRows
  const constituencies = tableOf({
    ...fromPeople,
    name: 'dpt',
    schema: rawConstituencyRowSchema
  })
  if (constituencies.status === 'failure') return constituencies

  const { groups, senators } = toSenators({
    constituencies: constituencies.data,
    groupRows: groupRows.data,
    memberships: memberships.data,
    seats: seats.data,
    senators: senatorRows.data,
    since: FIRST_COVERED_DAY
  })
  const senatorById = new Map(senators.map((senator) => [senator.id, senator]))
  const noMemberships: readonly SenateGroupMembership[] = []
  const membershipsOf = (senatorId: string) =>
    senatorById.get(senatorId)?.groups ?? noMemberships
  const groupNameById = new Map(groups.map((group) => [group.id, group.name]))
  const findLegislativeFile = legislativeFileFinder({
    bills: bills.data,
    chamberReadings: chamberReadings.data,
    readings: readings.data,
    sittings: sittings.data
  })
  const ballotsByScrutin = groupBy<RawSenatorBallotRow>(
    ballotRows.data,
    scrutinKey
  )
  const sentencesByScrutin = groupBy(correctionRows.data, scrutinKey)

  let unmatchedCorrections = 0
  let unchangedCorrections = 0
  const scrutins: SenateScrutinDetail[] = []
  for (const row of scrutinRows.data.toSorted((left, right) =>
    newestSenateScrutinFirst(
      { number: left.scrnum, session: left.sesann },
      { number: right.scrnum, session: right.sesann }
    )
  )) {
    const ballots = ballotsByScrutin.get(scrutinKey(row)) ?? []
    const { corrections, unmatched } = toSenateCorrections({
      flaggedSenators: ballots.filter(isFlaggedForCorrection).map((ballot) => {
        const senator = senatorById.get(ballot.senmat)
        const groupId = groupAtDate(membershipsOf(ballot.senmat), row.scrdat)
        return {
          fullName: senator ? `${senator.firstName} ${senator.lastName}` : '',
          groupName:
            groupId === null ? null : (groupNameById.get(groupId) ?? null),
          senatorId: ballot.senmat
        }
      }),
      sentences: (sentencesByScrutin.get(scrutinKey(row)) ?? []).map(
        (sentence) => sentence.corscrtxt
      )
    })
    unmatchedCorrections += unmatched.length
    const scrutin = toSenateScrutin({
      ballots,
      corrections,
      legislativeFile: findLegislativeFile(row.code),
      membershipsOf,
      row
    })
    if (scrutin.status === 'failure') return scrutin
    unchangedCorrections += corrections.length - scrutin.data.corrections.length
    scrutins.push(scrutin.data)
  }

  const senatorRecords = toSenatorRecords({
    scrutins,
    senatorIds: senators.map((senator) => senator.id)
  })
  if (senatorRecords.status === 'failure') return senatorRecords

  return Result.success({
    groups,
    missing: findMissingSenateScrutins(scrutins),
    report: { unchangedCorrections, unmatchedCorrections },
    scrutins,
    senatorRecords: senatorRecords.data,
    senators
  })
}
