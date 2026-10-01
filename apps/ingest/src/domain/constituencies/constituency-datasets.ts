import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { CommuneEntry } from '@on-record/protocol/assembly/commune.ts'
import type { ConstituencyContours } from '@on-record/protocol/assembly/constituency-contour.ts'

import {
  type CommuneMove,
  type CommunePlacement,
  type CurrentCommune,
  type PlacementReport,
  placeCommunes,
  type TableCommune
} from '@/domain/constituencies/commune-placement.ts'
import {
  findMissingContours,
  toConstituencyContours
} from '@/domain/constituencies/constituency-contours.ts'
import { parseCsv, recordsOf } from '@/domain/constituencies/csv-rows.ts'
import {
  assemblyDepartmentOf,
  assemblyDepartmentOfInsee,
  FRENCH_ABROAD_LETTERS,
  inseeCodeOfTableCommune
} from '@/domain/constituencies/official-departments.ts'
import {
  rawCommuneMoveSchema,
  rawCommuneSchema,
  rawContoursSchema,
  rawOverseasCommuneSchema,
  rawPostcodeSchema,
  rawTableRowSchema
} from '@/domain/constituencies/raw-geography.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

/**
 * Moves from this day on are followed from a table code to today's commune.
 * The table was updated in April 2017; starting a year earlier is harmless,
 * since a code that was current then has no move before it.
 */
const TABLE_CODES_DATE = '2016-01-01'

/** In the overseas collectivities file, the lines that are communes. */
const OVERSEAS_COMMUNE_NATURES = new Set(['CIR', 'COM'])

/** The source files of the "find my deputy" datasets, decoded. */
export type ConstituencyArchives = {
  communeMoves: string
  communes: string
  communeTableRows: readonly string[][]
  contours: string
  overseasCommunes: string
  postcodes: string
}

export type ConstituencyReport = PlacementReport & {
  /** Current communes La Poste gives no postcode to. */
  communesWithoutPostcode: number
  /** Constituencies of split communes with no published contour. */
  missingContours: string[]
  splitCommunes: number
}

export type ConstituencyDatasets = {
  communes: CommuneEntry[]
  contours: ConstituencyContours[]
  report: ConstituencyReport
}

type NamedCommune = CurrentCommune & { name: string }

const parseRecords = <Schema extends z.ZodType>({
  path,
  records,
  schema
}: {
  path: string
  records: readonly Record<string, string>[]
  schema: Schema
}): Result<z.output<Schema>[], IngestError> => {
  const parsed = z.array(schema).safeParse(records)
  if (!parsed.success) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: z.prettifyError(parsed.error),
      path
    })
  }
  return Result.success(parsed.data)
}

const parseContours = (
  text: string
): Result<z.output<typeof rawContoursSchema>, IngestError> => {
  const path = 'constituency contours'
  try {
    const json: unknown = JSON.parse(text)
    const contours = rawContoursSchema.safeParse(json)
    if (!contours.success) {
      return Result.failure({
        code: 'invalid_raw_file',
        issues: z.prettifyError(contours.error),
        path
      })
    }
    return Result.success(contours.data)
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path
    })
  }
}

const toTableCommunes = (
  rows: readonly z.output<typeof rawTableRowSchema>[]
): TableCommune[] => {
  const byCode = new Map<string, TableCommune>()
  for (const row of rows) {
    if (row['CODE DPT'] === FRENCH_ABROAD_LETTERS) continue
    const code = inseeCodeOfTableCommune({
      communeNumber: row['CODE COMMUNE'],
      ministryDepartment: row['CODE DPT']
    })
    const listed = byCode.get(code)
    byCode.set(code, {
      code,
      constituencies: [
        ...new Set([
          ...(listed?.constituencies ?? []),
          row['CODE CIRC LEGISLATIVE']
        ])
      ],
      department: assemblyDepartmentOf(row['CODE DPT'])
    })
  }
  return [...byCode.values()]
}

const toCurrentCommunes = ({
  communes,
  overseasCommunes
}: {
  communes: readonly z.output<typeof rawCommuneSchema>[]
  overseasCommunes: readonly z.output<typeof rawOverseasCommuneSchema>[]
}): NamedCommune[] => [
  ...communes
    .filter((commune) => commune.TYPECOM === 'COM')
    .map((commune) => ({
      canton: commune.CAN === '' ? null : commune.CAN,
      code: commune.COM,
      department: assemblyDepartmentOfInsee(commune.DEP),
      name: commune.LIBELLE
    })),
  ...overseasCommunes
    .filter((commune) => OVERSEAS_COMMUNE_NATURES.has(commune.NATURE_ZONAGE))
    .map((commune) => ({
      canton: null,
      code: commune.COM_COMER,
      department: assemblyDepartmentOfInsee(commune.COMER),
      name: commune.LIBELLE
    }))
]

const toCommuneMoves = (
  moves: readonly z.output<typeof rawCommuneMoveSchema>[]
): CommuneMove[] =>
  moves
    .filter(
      (move) =>
        move.DATE_EFF >= TABLE_CODES_DATE &&
        move.TYPECOM_AV === 'COM' &&
        move.TYPECOM_AP === 'COM' &&
        move.COM_AV !== move.COM_AP
    )
    .map((move) => ({ from: move.COM_AV, to: move.COM_AP }))

/**
 * Postcodes by commune. La Poste lists Paris, Lyon and Marseille by
 * arrondissement: their postcodes go to the commune.
 */
const toPostcodesByCommune = ({
  communes,
  postcodes
}: {
  communes: readonly z.output<typeof rawCommuneSchema>[]
  postcodes: readonly z.output<typeof rawPostcodeSchema>[]
}): ReadonlyMap<string, ReadonlySet<string>> => {
  const parentOfArrondissement = new Map(
    communes
      .filter((commune) => commune.TYPECOM === 'ARM')
      .map((arrondissement) => [arrondissement.COM, arrondissement.COMPARENT])
  )
  const postcodesByCommune = new Map<string, Set<string>>()
  for (const line of postcodes) {
    const listedCode = line['#Code_commune_INSEE']
    const code = parentOfArrondissement.get(listedCode) ?? listedCode
    const communePostcodes = postcodesByCommune.get(code) ?? new Set()
    postcodesByCommune.set(code, communePostcodes.add(line.Code_postal))
  }
  return postcodesByCommune
}

const toCommuneEntry = ({
  commune,
  placement,
  postcodes
}: {
  commune: NamedCommune
  placement: CommunePlacement
  postcodes: ReadonlySet<string> | undefined
}): CommuneEntry => [
  commune.code,
  commune.name,
  [...(postcodes ?? [])].toSorted(),
  placement.department,
  placement.constituencies
]

/**
 * The source files → the commune index and the contours of the split
 * communes' constituencies. Fails when a current commune cannot be placed:
 * the search would miss it in silence.
 */
export const toConstituencyDatasets = (
  archives: ConstituencyArchives
): Result<ConstituencyDatasets, IngestError> => {
  const tableRows = parseRecords({
    path: 'commune table',
    records: recordsOf(archives.communeTableRows),
    schema: rawTableRowSchema
  })
  if (tableRows.status === 'failure') return tableRows
  const communes = parseRecords({
    path: 'communes',
    records: recordsOf(parseCsv(archives.communes, ',')),
    schema: rawCommuneSchema
  })
  if (communes.status === 'failure') return communes
  const overseasCommunes = parseRecords({
    path: 'overseas communes',
    records: recordsOf(parseCsv(archives.overseasCommunes, ',')),
    schema: rawOverseasCommuneSchema
  })
  if (overseasCommunes.status === 'failure') return overseasCommunes
  const moves = parseRecords({
    path: 'commune moves',
    records: recordsOf(parseCsv(archives.communeMoves, ',')),
    schema: rawCommuneMoveSchema
  })
  if (moves.status === 'failure') return moves
  const postcodes = parseRecords({
    path: 'postcodes',
    records: recordsOf(parseCsv(archives.postcodes, ';')),
    schema: rawPostcodeSchema
  })
  if (postcodes.status === 'failure') return postcodes
  const contours = parseContours(archives.contours)
  if (contours.status === 'failure') return contours

  const currentCommunes = toCurrentCommunes({
    communes: communes.data,
    overseasCommunes: overseasCommunes.data
  })
  const { placements, report } = placeCommunes({
    currentCommunes,
    moves: toCommuneMoves(moves.data),
    tableCommunes: toTableCommunes(tableRows.data)
  })
  if (report.unplacedCommunes.length > 0) {
    return Result.failure({
      code: 'unplaced_communes',
      communeCodes: report.unplacedCommunes
    })
  }

  const postcodesByCommune = toPostcodesByCommune({
    communes: communes.data,
    postcodes: postcodes.data
  })
  const entries = currentCommunes
    .flatMap((commune) => {
      const placement = placements.get(commune.code)
      return placement === undefined
        ? []
        : [
            toCommuneEntry({
              commune,
              placement,
              postcodes: postcodesByCommune.get(commune.code)
            })
          ]
    })
    .toSorted((left, right) => left[0].localeCompare(right[0]))
  const constituencyContours = toConstituencyContours({
    contours: contours.data,
    placements: placements.values()
  })

  return Result.success({
    communes: entries,
    contours: constituencyContours,
    report: {
      ...report,
      communesWithoutPostcode: entries.filter((entry) => entry[2].length === 0)
        .length,
      missingContours: findMissingContours({
        contours: constituencyContours,
        placements: placements.values()
      }),
      splitCommunes: entries.filter((entry) => entry[4].length > 1).length
    }
  })
}
