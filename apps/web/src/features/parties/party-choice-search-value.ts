import { PARTY_CHOICES, type PartyChoice } from './party-selection'

/** How each choice is written in the URL, in French like the paths. */
const URL_TOKEN_OF_CHOICE = {
  horizons: 'horizons',
  lfi: 'lfi',
  others: 'autres',
  placePublique: 'place-publique',
  renaissance: 'renaissance',
  rn: 'rn'
} as const satisfies Record<PartyChoice, string>

/** Unknown tokens are dropped, so an old or hand-edited link still opens. */
export const parsePartyChoices = (value: string | null): PartyChoice[] => {
  const tokens = new Set(value?.split(',') ?? [])

  return PARTY_CHOICES.filter((choice) =>
    tokens.has(URL_TOKEN_OF_CHOICE[choice])
  )
}

/** `null` when nothing is chosen, so the parameter leaves the URL. */
export const partyChoicesSearchValue = (
  choices: readonly PartyChoice[]
): string | null =>
  choices.length === 0
    ? null
    : PARTY_CHOICES.filter((choice) => choices.includes(choice))
        .map((choice) => URL_TOKEN_OF_CHOICE[choice])
        .join(',')
