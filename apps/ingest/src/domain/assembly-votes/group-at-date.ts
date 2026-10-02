import type { GroupMembership } from '@on-record/protocol/assembly/deputy.ts'
import type { OrganId } from '@on-record/protocol/assembly/official-ids.ts'

const dayAfter = (isoDate: string): string =>
  Temporal.PlainDate.from(isoDate).add({ days: 1 }).toString()

/** `null` (still running) outlasts any date. */
const laterEnd = (left: string | null, right: string | null): string | null =>
  left === null || right === null ? null : left > right ? left : right

const continuesSpell = (
  spell: GroupMembership,
  next: GroupMembership
): boolean =>
  spell.groupId === next.groupId &&
  (spell.to === null || next.from <= dayAfter(spell.to))

/**
 * A deputy's group mandates folded into spells, oldest first. The Assemblée
 * repeats a mandate once per role (member, president…) and splits a spell at
 * a renewal: same-group mandates that overlap or follow each other the next
 * day are one spell.
 */
export const toGroupMemberships = (
  mandates: readonly GroupMembership[]
): GroupMembership[] => {
  const spells: GroupMembership[] = []
  for (const mandate of mandates.toSorted((left, right) =>
    left.from.localeCompare(right.from)
  )) {
    const lastSpell = spells.at(-1)
    if (lastSpell === undefined || !continuesSpell(lastSpell, mandate)) {
      spells.push(mandate)
    } else {
      spells[spells.length - 1] = {
        ...lastSpell,
        to: laterEnd(lastSpell.to, mandate.to)
      }
    }
  }
  return spells
}

/** The group a deputy belonged to on a day, or `null` if none. */
export const groupAtDate = (
  memberships: readonly GroupMembership[],
  isoDate: string
): OrganId | null =>
  memberships.findLast(
    (spell) =>
      spell.from <= isoDate && (spell.to === null || isoDate <= spell.to)
  )?.groupId ?? null
