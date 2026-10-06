import type { IsoDay } from '@/helpers/iso-day'

/** Midnight UTC of that day: format it with `timeZone: 'UTC'`, or it shifts. */
export const dateOfDay = (day: IsoDay): Date => new Date(`${day}T00:00:00Z`)

/** The first day of a month, `2020-03`, at midnight UTC: format it with `timeZone: 'UTC'`. */
export const dateOfMonth = (month: string): Date =>
  new Date(`${month}-01T00:00:00Z`)

/**
 * A timestamp the datasets carry — ISO 8601 (`generatedAt`) or an HTTP date
 * (a source's `Last-Modified`) — as the `Date` the translator formats.
 */
export const dateOfTimestamp = (timestamp: string): Date => new Date(timestamp)
