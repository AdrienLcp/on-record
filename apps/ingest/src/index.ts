import { ingest } from '@/domain/ingest-service.ts'
import { CACHE_DIR, DATA_DIR, githubOutputFile, isForcedRun } from '@/env.ts'
import { reportIngestOutcome } from '@/report-ingest-outcome.ts'

const outcome = await ingest({
  cacheDir: CACHE_DIR,
  dataDir: DATA_DIR,
  force: isForcedRun()
})

process.exitCode = await reportIngestOutcome(outcome, githubOutputFile())
