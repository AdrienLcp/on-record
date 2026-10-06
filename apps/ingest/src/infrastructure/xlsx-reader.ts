import { Result } from '@adrienlcp/result'
import { unzipSync } from 'fflate'
import { z } from 'zod'

import type { IngestError } from '@/domain/ingest-errors.ts'
import { checkRaw } from '@/domain/raw-parsing.ts'
import { readXml } from '@/infrastructure/xml-reader.ts'

const SHARED_STRINGS = 'xl/sharedStrings.xml'
const FIRST_SHEET = 'xl/worksheets/sheet1.xml'

const LIST_ELEMENTS: ReadonlySet<string> = new Set([
  'sst.si',
  'sst.si.r',
  'worksheet.sheetData.row',
  'worksheet.sheetData.row.c',
  'worksheet.sheetData.row.c.is.r'
])

const isListElement = (elementPath: string): boolean =>
  LIST_ELEMENTS.has(elementPath)

/** An element with neither attribute nor child, `<c/>`, which the parser reads as `''`. */
const emptyElementSchema = z.literal('')

const orEmptyElement = <Schema extends z.ZodType>(
  schema: Schema,
  empty: z.output<Schema>
) => z.union([schema, emptyElementSchema.transform(() => empty)])

/** An element's text: a bare string, or `#text` once it carries an attribute such as `xml:space`. */
const textSchema = z
  .union([z.string(), z.object({ '#text': z.string().default('') })])
  .transform((text) => (typeof text === 'string' ? text : text['#text']))

/** A shared or inline string: one `<t>`, or rich-text runs each with its own. */
const stringItemSchema = z
  .object({
    r: z.array(z.object({ t: textSchema.default('') })).default([]),
    t: textSchema.optional()
  })
  .transform(({ r, t }) => t ?? r.map((run) => run.t).join(''))

const sharedStringsSchema = z.object({
  sst: z.object({
    si: z.array(orEmptyElement(stringItemSchema, '')).default([])
  })
})

const filledCellSchema = z.object({
  '@_r': z.string().optional(),
  '@_t': z.string().optional(),
  is: stringItemSchema.optional(),
  v: textSchema.optional()
})

const cellSchema = orEmptyElement(filledCellSchema, {})

type SheetCell = z.output<typeof filledCellSchema>

const sheetSchema = z.object({
  worksheet: z.object({
    sheetData: z
      .object({
        row: z
          .array(
            orEmptyElement(z.object({ c: z.array(cellSchema).default([]) }), {
              c: []
            })
          )
          .default([])
      })
      .or(emptyElementSchema.transform(() => ({ row: [] })))
  })
})

const COLUMN_LETTERS = /^[A-Z]+/

const columnIndexOf = (reference: string): number | null => {
  const letters = COLUMN_LETTERS.exec(reference)?.[0]
  if (letters === undefined) return null
  return (
    [...letters].reduce(
      (index, letter) => index * 26 + letter.charCodeAt(0) - 64,
      0
    ) - 1
  )
}

const textOfCell = (
  cell: SheetCell,
  sharedStrings: readonly string[]
): string => {
  if (cell['@_t'] === 'inlineStr') return cell.is ?? ''
  const value = cell.v ?? ''
  if (cell['@_t'] === 's') return sharedStrings[Number(value)] ?? ''
  return value
}

const readPart = <Schema extends z.ZodType>(
  bytes: Uint8Array,
  schema: Schema,
  path: string
): Result<z.output<Schema>, IngestError> => {
  const document = readXml({
    isList: isListElement,
    keepAttributes: true,
    keepWhitespace: true,
    path,
    text: new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  })
  if (document.status === 'failure') return document
  return checkRaw(document.data, schema, path)
}

/**
 * The first sheet of an `.xlsx` workbook as rows of cell texts, empty cells
 * as `''`. Numbers come back as the digits the file stores.
 */
export const readFirstSheet = (
  url: string,
  workbook: Uint8Array
): Result<string[][], IngestError> => {
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(workbook, {
      filter: (entry) =>
        entry.name === SHARED_STRINGS || entry.name === FIRST_SHEET
    })
  } catch (error) {
    return Result.failure({ code: 'unzip_failed', reason: String(error), url })
  }
  const sheetFile = entries[FIRST_SHEET]
  if (sheetFile === undefined) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: 'The workbook has no first sheet',
      path: url
    })
  }
  const sharedStringsFile = entries[SHARED_STRINGS]
  const sharedStrings =
    sharedStringsFile === undefined
      ? Result.success({ sst: { si: [] } })
      : readPart(sharedStringsFile, sharedStringsSchema, `${url} strings`)
  if (sharedStrings.status === 'failure') return sharedStrings
  const sheet = readPart(sheetFile, sheetSchema, `${url} sheet`)
  if (sheet.status === 'failure') return sheet

  const rows = sheet.data.worksheet.sheetData.row.map((row) => {
    const cells: string[] = []
    for (const cell of row.c) {
      const index = columnIndexOf(cell['@_r'] ?? '') ?? cells.length
      while (cells.length < index) cells.push('')
      cells[index] = textOfCell(cell, sharedStrings.data.sst.si)
    }
    return cells
  })
  return Result.success(rows)
}
