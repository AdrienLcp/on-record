import type { Deputy } from '@on-record/protocol/assembly/deputy'
import {
  type DeputyId,
  deputyIdSchema,
  type OrganId
} from '@on-record/protocol/assembly/official-ids'

import { type IsoDay, isDayWithin } from '@/helpers/iso-day'

export const fullNameOf = (deputy: Deputy): string =>
  `${deputy.firstName} ${deputy.lastName}`

/** Still holds a seat: their last mandate has no end. */
export const isSitting = (deputy: Deputy): boolean =>
  deputy.mandates.some((mandate) => mandate.to === null)

/** The day a deputy who left gave up their seat, or `null` while they sit. */
export const leftOfficeOn = (deputy: Deputy): IsoDay | null =>
  isSitting(deputy) ? null : (deputy.mandates.at(-1)?.to ?? null)

export const isSeatedOn = ({
  day,
  deputy
}: {
  day: IsoDay
  deputy: Deputy
}): boolean => deputy.mandates.some((period) => isDayWithin({ day, period }))

/** The group a deputy belonged to on the day of a vote, not today's. */
export const groupIdOn = ({
  day,
  deputy
}: {
  day: IsoDay
  deputy: Deputy
}): OrganId | null =>
  deputy.groups.find((membership) => isDayWithin({ day, period: membership }))
    ?.groupId ?? null

/** Today's group, or the last one of a deputy who left. */
export const latestGroupIdOf = (deputy: Deputy): OrganId | null =>
  deputy.groups.at(-1)?.groupId ?? null

export const parseDeputyId = (text: string): DeputyId | null => {
  const parsed = deputyIdSchema.safeParse(text)

  return parsed.success ? parsed.data : null
}
