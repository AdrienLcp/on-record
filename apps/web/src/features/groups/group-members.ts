import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import { isSitting, latestGroupIdOf } from '@/features/deputies/deputy'

/** How many sitting deputies each group holds today. */
export const sittingMemberCounts = (
  deputies: readonly Deputy[]
): ReadonlyMap<OrganId, number> =>
  deputies.filter(isSitting).reduce((counts, deputy) => {
    const groupId = latestGroupIdOf(deputy)

    return groupId === null
      ? counts
      : counts.set(groupId, (counts.get(groupId) ?? 0) + 1)
  }, new Map<OrganId, number>())

export const groupsById = (
  groups: readonly Group[]
): ReadonlyMap<OrganId, Group> =>
  new Map(groups.map((group) => [group.id, group]))

/** Active groups, largest first; ties keep the dataset's order. */
export const activeGroupsBySize = ({
  counts,
  groups
}: {
  counts: ReadonlyMap<OrganId, number>
  groups: readonly Group[]
}): Group[] =>
  groups
    .filter((group) => group.to === null)
    .toSorted(
      (first, second) =>
        (counts.get(second.id) ?? 0) - (counts.get(first.id) ?? 0)
    )
