/** Rows keyed by the names of the first row, the header; a missing cell is `''`. */
export const recordsOf = (
  rows: readonly string[][]
): Record<string, string>[] => {
  const [header, ...body] = rows
  if (header === undefined) return []
  return body.map((row) =>
    Object.fromEntries(header.map((name, column) => [name, row[column] ?? '']))
  )
}
