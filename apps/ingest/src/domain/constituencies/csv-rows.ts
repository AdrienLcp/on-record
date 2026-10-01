const QUOTE = '"'

/**
 * A delimited text file → its rows of fields. Fields may be quoted, with `""`
 * for a quote inside; line ends may be `\n` or `\r\n`. Blank lines are skipped.
 */
export const parseCsv = (text: string, separator: ',' | ';'): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let isQuoted = false

  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    if (row.some((value) => value !== '')) rows.push(row)
    row = []
  }

  for (let index = 0; index < text.length; index++) {
    const character = text[index]
    if (isQuoted) {
      if (character === QUOTE && text[index + 1] === QUOTE) {
        field += QUOTE
        index++
      } else if (character === QUOTE) {
        isQuoted = false
      } else {
        field += character
      }
    } else if (character === QUOTE) {
      isQuoted = true
    } else if (character === separator) {
      endField()
    } else if (character === '\n') {
      endRow()
    } else if (character !== '\r') {
      field += character
    }
  }
  if (field !== '' || row.length > 0) endRow()
  return rows
}

/** Rows keyed by the names of the first row, the header. */
export const recordsOf = (
  rows: readonly string[][]
): Record<string, string>[] => {
  const [header, ...body] = rows
  if (header === undefined) return []
  return body.map((row) =>
    Object.fromEntries(header.map((name, column) => [name, row[column] ?? '']))
  )
}
