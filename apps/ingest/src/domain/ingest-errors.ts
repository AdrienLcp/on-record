/** Every way an ingest run can fail; each one stops the run. */
export type IngestError =
  | { code: 'cache_unavailable'; path: string; reason: string }
  | { code: 'download_failed'; reason: string; url: string }
  | { code: 'invalid_dataset'; issues: string; path: string }
  | { code: 'invalid_raw_file'; issues: string; path: string }
  | { code: 'missing_seat'; deputyId: string }
  | { code: 'too_many_files'; count: number; limit: number }
  | { code: 'unknown_deputy'; deputyId: string; scrutin: number }
  | { code: 'unknown_group'; groupId: string }
  | { code: 'unplaced_communes'; communeCodes: string[] }
  | { code: 'unresolved_group'; scrutin: number }
  | { code: 'unzip_failed'; reason: string; url: string }
  | { code: 'write_failed'; path: string; reason: string }
