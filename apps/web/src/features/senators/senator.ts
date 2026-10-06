import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import {
  type SenateGroupId,
  type SenatorId,
  senatorIdSchema
} from '@on-record/protocol/senate/senate-ids'
import type { Senator } from '@on-record/protocol/senate/senator'

import { type IsoDay, isDayWithin } from '@/helpers/iso-day'

export const senatorFullNameOf = (senator: Senator): string =>
  `${senator.firstName} ${senator.lastName}`

/** Still holds a seat: their last mandate has no end. */
export const isSenatorSitting = (senator: Senator): boolean =>
  senator.mandates.some((mandate) => mandate.to === null)

/** The day a senator who left gave up their seat, or `null` while they sit. */
export const senatorLeftOfficeOn = (senator: Senator): IsoDay | null =>
  isSenatorSitting(senator) ? null : (senator.mandates.at(-1)?.to ?? null)

/** The group a senator belonged to on the day of a vote, not today's. */
export const senateGroupIdOn = ({
  day,
  senator
}: {
  day: IsoDay
  senator: Senator
}): SenateGroupId | null =>
  senator.groups.find((membership) => isDayWithin({ day, period: membership }))
    ?.groupId ?? null

/** Today's group, or the last one of a senator who left. */
export const latestSenateGroupIdOf = (senator: Senator): SenateGroupId | null =>
  senator.groups.at(-1)?.groupId ?? null

export const senateGroupsById = (
  groups: readonly SenateGroup[]
): ReadonlyMap<SenateGroupId, SenateGroup> =>
  new Map(groups.map((group) => [group.id, group]))

export const parseSenatorId = (text: string): SenatorId | null => {
  const parsed = senatorIdSchema.safeParse(text)

  return parsed.success ? parsed.data : null
}
