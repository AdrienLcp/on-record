export const now = (): Temporal.Instant =>
  Temporal.Instant.fromEpochMilliseconds(Date.now())
