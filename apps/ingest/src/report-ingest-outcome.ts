import type { Result } from '@adrienlcp/result'

import type { IngestError } from '@/domain/ingest-errors.ts'
import type { IngestOutcome } from '@/domain/ingest-service.ts'
import { writeStepOutput } from '@/infrastructure/github-step-output.ts'
import { logEvent, logFailure } from '@/ingest-log.ts'

/**
 * The step output a workflow reads to skip deploying after an unchanged run:
 * `steps.<id>.outputs.changed` is `'true'` when datasets were rebuilt.
 */
const CHANGED_OUTPUT = 'changed'

/**
 * Logs the run's outcome and, under GitHub Actions, sets the `changed` step
 * output. Returns the process exit code.
 */
export const reportIngestOutcome = async (
  outcome: Result<IngestOutcome, IngestError>,
  githubOutputFile: string | null
): Promise<number> => {
  if (outcome.status === 'failure') {
    logFailure('ingest_failed', outcome.error)
    return 1
  }

  const { sourceChanges } = outcome.data
  if (outcome.data.status === 'built') {
    logEvent('datasets_written', { ...outcome.data.report, sourceChanges })
  } else {
    logEvent('sources_unchanged', { sourceChanges })
  }
  if (githubOutputFile === null) return 0

  const written = await writeStepOutput({
    name: CHANGED_OUTPUT,
    outputFile: githubOutputFile,
    value: String(outcome.data.status === 'built')
  })
  if (written.status === 'failure') {
    logFailure('step_output_unwritable', { file: githubOutputFile })
    return 1
  }
  return 0
}
