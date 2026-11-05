import type { RejectedDownload } from '@/domain/ingest-service.ts'
import { now } from '@/infrastructure/clock.ts'
import { logEvent } from '@/ingest-log.ts'

/**
 * Logs a new version its source's validation refused, with the age of the
 * cached copy kept instead, and under GitHub Actions raises a warning on the
 * run: the run itself goes on and stays green.
 */
export const reportRejectedDownload = (
  { error, keptCopySavedAt, sourceId }: RejectedDownload,
  githubOutputFile: string | null
): void => {
  const keptCopyAgeHours = Math.round(
    now().since(keptCopySavedAt).total('hours')
  )
  logEvent('download_rejected', {
    source: sourceId,
    ...error,
    keptCopyAgeHours
  })
  if (githubOutputFile !== null) {
    console.info(
      `::warning title=Download rejected::${sourceId} refused, kept from a cached copy ${keptCopyAgeHours} h old`
    )
  }
}
