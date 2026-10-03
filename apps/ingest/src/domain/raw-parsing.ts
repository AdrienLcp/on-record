import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type { IngestError } from '@/domain/ingest-errors.ts'

/** Reads a source file's JSON text, before any check of its shape. */
export const parseJsonText = (
  text: string,
  path: string
): Result<unknown, IngestError> => {
  try {
    const json: unknown = JSON.parse(text)
    return Result.success(json)
  } catch (error) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: String(error),
      path
    })
  }
}

/** Checks a value read from a source file against the shape the ingest relies on. */
export const checkRaw = <Schema extends z.ZodType>(
  value: unknown,
  schema: Schema,
  path: string
): Result<z.output<Schema>, IngestError> => {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return Result.failure({
      code: 'invalid_raw_file',
      issues: z.prettifyError(parsed.error),
      path
    })
  }
  return Result.success(parsed.data)
}

/** Reads a source file's JSON text and checks its shape. */
export const parseRawJson = <Schema extends z.ZodType>(
  text: string,
  schema: Schema,
  path: string
): Result<z.output<Schema>, IngestError> => {
  const json = parseJsonText(text, path)
  if (json.status === 'failure') return json
  return checkRaw(json.data, schema, path)
}
