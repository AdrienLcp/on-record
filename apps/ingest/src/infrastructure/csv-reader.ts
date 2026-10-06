import { Result } from '@adrienlcp/result'
import { parse } from 'csv-parse/sync'

import { recordsOf } from '@/domain/header-records.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

/**
 * A delimited text file → its rows keyed by its header. Fields may be quoted,
 * with `""` for a quote inside; line ends may be `\n` or `\r\n`. Rows with no
 * value at all are skipped.
 */
export const readCsvRecords = ({
  path,
  separator,
  text
}: {
  path: string
  separator: ',' | ';'
  text: string
}): Result<Record<string, string>[], IngestError> => {
  try {
    const rows: string[][] = parse(text, {
      delimiter: separator,
      relax_column_count: true,
      skip_records_with_empty_values: true
    })
    return Result.success(recordsOf(rows))
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path
    })
  }
}
