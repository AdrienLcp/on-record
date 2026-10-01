import { Result } from '@adrienlcp/result'
import type { z } from 'zod'

import { DATASETS_BASE_PATH } from '@on-record/protocol/datasets'

/**
 * - `aborted` — a newer request superseded this one: never shown
 * - `missing` — no dataset at that path, such as an unknown deputy
 * - `network` — the file could not be downloaded
 * - `invalid` — the file does not match its protocol schema
 */
export type DatasetError = 'aborted' | 'invalid' | 'missing' | 'network'

type DatasetRequest = {
  /** An entry of `datasetPaths`. */
  path: string
  signal: AbortSignal
}

const HTTP_NOT_FOUND = 404

const downloadJson = async ({
  path,
  signal
}: DatasetRequest): Promise<Result<unknown, DatasetError>> => {
  try {
    const response = await fetch(`${DATASETS_BASE_PATH}/${path}`, { signal })

    if (response.status === HTTP_NOT_FOUND) {
      return Result.failure('missing')
    }

    if (!response.ok) {
      return Result.failure('network')
    }

    const text = await response.text()

    try {
      const json: unknown = JSON.parse(text)

      return Result.success(json)
    } catch {
      return Result.failure('invalid')
    }
  } catch {
    return Result.failure(signal.aborted ? 'aborted' : 'network')
  }
}

/**
 * A reader of one dataset, which keeps every file it parsed for the rest of
 * the visit: the scrutin index weighs megabytes and several pages read it,
 * while the data changes once a night. A failure is never kept, so the next
 * page tries again.
 */
export const createDatasetReader = <T>(schema: z.ZodType<T>) => {
  const parsedByPath = new Map<string, T>()

  return async ({
    path,
    signal
  }: DatasetRequest): Promise<Result<T, DatasetError>> => {
    const kept = parsedByPath.get(path)

    if (kept !== undefined) {
      return Result.success(kept)
    }

    const json = await downloadJson({ path, signal })

    if (json.status === 'failure') {
      return json
    }

    const parsed = schema.safeParse(json.data)

    if (!parsed.success) {
      return Result.failure('invalid')
    }

    parsedByPath.set(path, parsed.data)

    return Result.success(parsed.data)
  }
}
