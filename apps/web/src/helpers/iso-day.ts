/**
 * A calendar day as the datasets write it, `YYYY-MM-DD`. Compared as text:
 * that format sorts in date order.
 */
export type IsoDay = string

export type Period = {
  from: IsoDay
  /** `null` while it lasts. */
  to: IsoDay | null
}

export const isDayWithin = ({
  day,
  period
}: {
  day: IsoDay
  period: Period
}): boolean => period.from <= day && (period.to === null || day <= period.to)
