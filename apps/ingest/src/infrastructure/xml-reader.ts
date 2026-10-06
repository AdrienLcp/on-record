import { Result } from '@adrienlcp/result'
import { XMLParser } from 'fast-xml-parser'

import type { IngestError } from '@/domain/ingest-errors.ts'

/**
 * An XML document as plain values: every text stays a string, character
 * references are decoded, and an element whose path `isList` accepts is always
 * an array — the parser otherwise gives a lone child as a bare object.
 * Attributes are dropped and texts trimmed unless asked otherwise.
 */
export const readXml = ({
  isList,
  keepAttributes = false,
  keepWhitespace = false,
  path,
  text
}: {
  /** Receives the element's dotted path: `declaration.mandatElectifDto.items.items`. */
  isList: (elementPath: string) => boolean
  /** Keeps attributes, as `@_`-prefixed keys: `<c r="A1">` → `{ '@_r': 'A1' }`; the element's own text is then under `#text`. */
  keepAttributes?: boolean
  keepWhitespace?: boolean
  path: string
  text: string
}): Result<unknown, IngestError> => {
  const parser = new XMLParser({
    htmlEntities: true,
    ignoreAttributes: !keepAttributes,
    isArray: (_name, elementPath) => isList(String(elementPath)),
    parseTagValue: false,
    trimValues: !keepWhitespace
  })
  try {
    const document: unknown = parser.parse(text, true)
    return Result.success(document)
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path
    })
  }
}
