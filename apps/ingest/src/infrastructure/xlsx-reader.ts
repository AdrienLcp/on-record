import { Result } from '@adrienlcp/result'
import { unzipSync } from 'fflate'

import type { IngestError } from '@/domain/ingest-errors.ts'

const SHARED_STRINGS = 'xl/sharedStrings.xml'
const FIRST_SHEET = 'xl/worksheets/sheet1.xml'

const ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"'
}

const decodeEntities = (xml: string): string =>
  xml.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, name: string) => {
    if (name.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    }
    if (name.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
    }
    return ENTITIES[name] ?? entity
  })

/** The text of every `<t>` run inside an element, rich-text runs joined. */
const textOf = (xml: string): string =>
  decodeEntities(
    [...xml.matchAll(/<t(?:\s[^>]*)?>([^<]*)<\/t>/g)]
      .map((run) => run[1])
      .join('')
  )

const columnIndexOf = (letters: string): number =>
  [...letters].reduce(
    (index, letter) => index * 26 + letter.charCodeAt(0) - 64,
    0
  ) - 1

const readCell = (
  attributes: string,
  content: string,
  sharedStrings: readonly string[]
): string => {
  const type = /\bt="(\w+)"/.exec(attributes)?.[1]
  if (type === 'inlineStr') return textOf(content)
  const value = /<v>([^<]*)<\/v>/.exec(content)?.[1] ?? ''
  if (type === 's') return sharedStrings[Number(value)] ?? ''
  return decodeEntities(value)
}

/**
 * The first sheet of an `.xlsx` workbook as rows of cell texts, empty cells
 * as `''`. Numbers come back as the digits the file stores.
 */
export const readFirstSheet = (
  url: string,
  workbook: Uint8Array
): Result<string[][], IngestError> => {
  try {
    const entries = unzipSync(workbook, {
      filter: (entry) =>
        entry.name === SHARED_STRINGS || entry.name === FIRST_SHEET
    })
    const decoder = new TextDecoder('utf-8', { fatal: true })
    const sheet = entries[FIRST_SHEET]
    if (sheet === undefined) {
      return Result.failure({
        code: 'invalid_raw_file',
        issues: 'The workbook has no first sheet',
        path: url
      })
    }
    const sharedStringsFile = entries[SHARED_STRINGS]
    const sharedStrings =
      sharedStringsFile === undefined
        ? []
        : [
            ...decoder
              .decode(sharedStringsFile)
              .matchAll(/<si>([\s\S]*?)<\/si>/g)
          ].map((item) => textOf(item[1] ?? ''))

    const rows = [
      ...decoder.decode(sheet).matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)
    ].map((row) => {
      const cells: string[] = []
      for (const cell of (row[1] ?? '').matchAll(
        /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
      )) {
        const attributes = cell[1] ?? ''
        const column = /\br="([A-Z]+)\d+"/.exec(attributes)?.[1]
        const index =
          column === undefined ? cells.length : columnIndexOf(column)
        while (cells.length < index) cells.push('')
        cells[index] = readCell(attributes, cell[2] ?? '', sharedStrings)
      }
      return cells
    })
    return Result.success(rows)
  } catch (error) {
    return Result.failure({ code: 'unzip_failed', reason: String(error), url })
  }
}
