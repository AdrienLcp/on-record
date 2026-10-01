import { ingestAssemblyVotes } from '@/domain/assembly-votes/assembly-votes-service.ts'
import { env } from '@/env.ts'
import { reportIngestOutcome } from '@/report-ingest-outcome.ts'

const outcome = await ingestAssemblyVotes({
  cacheDir: env.cacheDir,
  dataDir: env.dataDir,
  force: env.force
})

process.exitCode = await reportIngestOutcome(outcome, env.githubOutputFile)
