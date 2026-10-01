import type { GroupMembership } from '@on-record/protocol/assembly/deputy.ts'

/** The "Non inscrit" organ of the 17th legislature: deputies in no group. */
export const NON_ATTACHED_GROUP_ID = 'PO840056'

/**
 * Groups were declared on 2024-07-18, ten days into the legislature; until
 * then the Assemblée lists every deputy as non-attached. A non-attached spell
 * that ends by this day and is followed by a group was that wait, not a choice.
 */
export const GROUPS_FORMED_BY = '2024-07-31'

const isWaitForGroups = (
  spell: GroupMembership,
  next: GroupMembership | undefined
): boolean =>
  spell.groupId === NON_ATTACHED_GROUP_ID &&
  spell.to !== null &&
  spell.to <= GROUPS_FORMED_BY &&
  next !== undefined &&
  next.groupId !== NON_ATTACHED_GROUP_ID

/**
 * A deputy's spells, oldest first, without the non-attached wait for the
 * groups to form. A deputy who stayed non-attached keeps that spell.
 */
export const withoutWaitForGroups = (
  spells: readonly GroupMembership[]
): GroupMembership[] =>
  spells.filter((spell, index) => !isWaitForGroups(spell, spells[index + 1]))
