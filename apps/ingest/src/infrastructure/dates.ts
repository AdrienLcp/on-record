import { Result } from '@adrienlcp/result'

export type InvalidHttpDate = { code: 'invalid_http_date'; text: string }

/**
 * Reads an HTTP date (`Thu, 01 Oct 2026 04:26:24 GMT`), the format of a
 * `Last-Modified` header. Temporal parses RFC 3339 only, so this one goes
 * through `Date.parse`.
 */
export const parseHttpDate = (
  text: string
): Result<Temporal.Instant, InvalidHttpDate> => {
  const epochMilliseconds = Date.parse(text)
  return Number.isNaN(epochMilliseconds)
    ? Result.failure({ code: 'invalid_http_date', text })
    : Result.success(Temporal.Instant.fromEpochMilliseconds(epochMilliseconds))
}
