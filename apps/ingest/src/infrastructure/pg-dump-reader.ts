import { Result } from '@adrienlcp/result'

import type { IngestError } from '@/domain/ingest-errors.ts'

/** One row of a dumped table, by column name; `null` is SQL `NULL`. */
export type DumpRow = Readonly<Record<string, string | null>>

/** Which tables to keep, each with an optional filter applied while reading. */
export type TableSelection = Readonly<
  Record<string, ((row: DumpRow) => boolean) | null>
>

const COPY_HEADER = /^COPY (?:public\.)?(\w+) \(([^)]*)\) FROM stdin;$/
const END_OF_COPY = '\\.'
const NULL_FIELD = '\\N'

const ESCAPED_CHARACTERS: Readonly<Record<string, string>> = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
  v: '\v'
}

/** Undoes the backslash escapes of PostgreSQL's COPY text format. */
const unescapeCopyField = (field: string): string =>
  field.includes('\\')
    ? field.replace(
        /\\(x[0-9a-fA-F]{1,2}|[0-7]{1,3}|.)/g,
        (_escape, code: string) => {
          if (code.startsWith('x')) {
            return String.fromCharCode(Number.parseInt(code.slice(1), 16))
          }
          if (/^[0-7]/.test(code)) {
            return String.fromCharCode(Number.parseInt(code, 8))
          }
          return ESCAPED_CHARACTERS[code] ?? code
        }
      )
    : field

const toRow = (columns: readonly string[], line: string): DumpRow => {
  const fields = line.split('\t')
  return Object.fromEntries(
    columns.map((column, index) => {
      const field = fields[index]
      if (field === undefined || field === NULL_FIELD) return [column, null]
      return [column, unescapeCopyField(field)]
    })
  )
}

/**
 * Reads the `COPY … FROM stdin` blocks of a PostgreSQL plain-text dump, without
 * a database: only the selected tables, each row filtered as it is read so a
 * million-row table never sits in memory whole. Fails when a selected table
 * is not in the dump.
 */
export const readDumpTables = ({
  path,
  selection,
  text
}: {
  path: string
  selection: TableSelection
  text: string
}): Result<ReadonlyMap<string, DumpRow[]>, IngestError> => {
  const tables = new Map<string, DumpRow[]>()
  let lineStart = 0
  let table: {
    columns: string[]
    keep: ((row: DumpRow) => boolean) | null
    rows: DumpRow[]
  } | null = null
  while (lineStart < text.length) {
    const lineEnd = text.indexOf('\n', lineStart)
    const end = lineEnd === -1 ? text.length : lineEnd
    const line = text.slice(lineStart, end).replace(/\r$/, '')
    lineStart = end + 1
    if (table !== null) {
      if (line === END_OF_COPY) {
        table = null
        continue
      }
      const row = toRow(table.columns, line)
      if (table.keep === null || table.keep(row)) table.rows.push(row)
      continue
    }
    const header = COPY_HEADER.exec(line)
    if (header === null) continue
    const [, name = '', columnList = ''] = header
    if (!(name in selection)) continue
    const rows: DumpRow[] = []
    tables.set(name, rows)
    table = {
      columns: columnList.split(',').map((column) => column.trim()),
      keep: selection[name] ?? null,
      rows
    }
  }
  const missing = Object.keys(selection).filter((name) => !tables.has(name))
  if (missing.length > 0) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: `tables missing from the dump: ${missing.join(', ')}`,
      path
    })
  }
  return Result.success(tables)
}
