import { Result } from '@adrienlcp/result'

import type { IngestError } from '@/domain/ingest-errors.ts'
import type { ValidateRawFile } from '@/domain/open-data-source.ts'
import {
  decodeTextFile,
  listZipEntryNames,
  unzipSingleTextFile
} from '@/infrastructure/open-data-client.ts'
import { checkDumpTables } from '@/infrastructure/pg-dump-reader.ts'
import { readFirstSheet } from '@/infrastructure/xlsx-reader.ts'

const HAS_VISIBLE_CHARACTER = /\S/

const invalidRawFile = (url: string, issues: string) =>
  Result.failure({
    code: 'invalid_raw_file',
    issues,
    path: url
  } satisfies IngestError)

/**
 * A zip of JSON files: its directory opens and lists one at least. Nothing is
 * inflated, since the amendments zip alone takes 80 s to read through.
 */
export const validateJsonArchive: ValidateRawFile = ({ bytes, url }) => {
  const names = listZipEntryNames(url, bytes)
  if (names.status === 'failure') return names
  if (!names.data.some((name) => name.endsWith('.json'))) {
    return invalidRawFile(url, 'the archive holds no JSON file')
  }
  return Result.success()
}

/** A zipped PostgreSQL dump: one `.sql` file holding every table the ingest reads. */
export const validateSqlDump =
  (tables: readonly string[]): ValidateRawFile =>
  ({ bytes, url }) => {
    const text = unzipSingleTextFile({ extension: '.sql', url, zip: bytes })
    if (text.status === 'failure') return text
    return checkDumpTables({ path: url, tables, text: text.data })
  }

/** A text file: it decodes in `encoding` and is not blank. */
export const validateTextFile =
  (encoding: 'latin1' | 'utf-8'): ValidateRawFile =>
  ({ bytes, url }) => {
    const text = decodeTextFile({ bytes, encoding, url })
    if (text.status === 'failure') return text
    if (!HAS_VISIBLE_CHARACTER.test(text.data)) {
      return invalidRawFile(url, 'the file is blank')
    }
    return Result.success()
  }

/** An `.xlsx` workbook whose first sheet has rows. */
export const validateWorkbook: ValidateRawFile = ({ bytes, url }) => {
  const rows = readFirstSheet(url, bytes)
  if (rows.status === 'failure') return rows
  if (rows.data.length === 0) {
    return invalidRawFile(url, 'the first sheet is empty')
  }
  return Result.success()
}
