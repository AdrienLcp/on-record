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

/** How each choice is written in the URL, in French like the paths. */
const URL_TOKEN_OF_CHOICE = {
  horizons: 'horizons',
  lfi: 'lfi',
  others: 'autres',
  placePublique: 'place-publique',
  renaissance: 'renaissance',
  rn: 'rn'
} as const satisfies Record<PartyChoice, string>

export const isPartyChoice = (key: unknown): key is PartyChoice =>
  PARTY_CHOICES.some((choice) => choice === key)

/** Unknown tokens are dropped, so an old or hand-edited link still opens. */
export const parsePartyChoices = (value: string | null): PartyChoice[] => {
  const tokens = new Set(value?.split(',') ?? [])

  return PARTY_CHOICES.filter((choice) =>
    tokens.has(URL_TOKEN_OF_CHOICE[choice])
  )
}

/** `null` when nothing is chosen, so the parameter leaves the URL. */
export const partyChoicesValue = (
  choices: readonly PartyChoice[]
): string | null =>
  choices.length === 0
    ? null
    : PARTY_CHOICES.filter((choice) => choices.includes(choice))
        .map((choice) => URL_TOKEN_OF_CHOICE[choice])
        .join(',')

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
