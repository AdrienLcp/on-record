import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import {
  type PartyId,
  PRESIDENTIAL_RACE,
  racePartyOfGroup
} from './presidential-race'

/** One chip of the party filter: a race party, or every other group at once. */
export type PartyChoice = PartyId | 'others'

/** In the order the chips show: the race by poll average, then the rest. */
export const PARTY_CHOICES: readonly PartyChoice[] = [
  ...PRESIDENTIAL_RACE.parties.map((party) => party.id),
  'others'
]

export const isPartyChoice = (key: unknown): key is PartyChoice =>
  PARTY_CHOICES.some((choice) => choice === key)

/**
 * Nothing chosen shows every group. A group no race party votes through, and
 * a deputy outside any group, fall under `others`.
 */
export const isGroupShownBy = ({
  choices,
  groupId
}: {
  choices: readonly PartyChoice[]
  groupId: OrganId | null
}): boolean => {
  if (choices.length === 0) {
    return true
  }

  const party = groupId === null ? null : racePartyOfGroup(groupId)

  return choices.includes(party?.id ?? 'others')
}
