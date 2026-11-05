import type { Result } from '@adrienlcp/result'

import type { IngestError } from '@/domain/ingest-errors.ts'

/** Tells a downloaded file the ingest can read from a broken one. */
export type ValidateRawFile = (download: {
  bytes: Uint8Array
  url: string
}) => Result<void, IngestError>

/** One file an official publisher serves, refreshed into the download cache. */
export type OpenDataSource = {
  /** Stable id, shown on the sources page. */
  id: string
  url: string
  /** Run on every new version: one it refuses never replaces the cached copy. */
  validate: ValidateRawFile
}
