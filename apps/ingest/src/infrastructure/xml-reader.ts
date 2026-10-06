import { Result } from '@adrienlcp/result'
import { XMLParser } from 'fast-xml-parser'

import type { IngestError } from '@/domain/ingest-errors.ts'

/**
 * An XML document as plain values: every text stays a string, attributes are
 * dropped, and an element whose path `isList` accepts is always an array — the
 * parser otherwise gives a lone child as a bare object.
 */
export const readXml = ({
  isList,
  path,
  text
}: {
  /** Receives the element's dotted path: `declaration.mandatElectifDto.items.items`. */
  isList: (elementPath: string) => boolean
  path: string
  text: string
}): Result<unknown, IngestError> => {
  const parser = new XMLParser({
    ignoreAttributes: true,
    isArray: (_name, elementPath) => isList(String(elementPath)),
    parseTagValue: false
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
