import type { OrganId } from '@on-record/protocol/assembly/official-ids'

export type PartyId =
  | 'lfi'
  | 'horizons'
  | 'placePublique'
  | 'renaissance'
  | 'rn'

/** A party in the 2027 race and the group its deputies vote in. */
export type RaceParty = {
  id: PartyId
  /** Its mean share across the polls of the window, in percent. */
  pollAverage: number
  /**
   * The group whose published positions speak for it. Allied groups are not
   * merged in: UDR is a party of its own in the Assemblée data, and MoDem
   * (Dem) fields no candidate.
   */
  groupId: OrganId
  /** `true` when the party has no group and its deputies sit in an ally's. */
  sitsInAllyGroup: boolean
  /**
   * `false` when the group's acronym does not say the party (EPR for
   * Renaissance): the filter then shows the acronym beside the party's name.
   */
  groupBearsItsName: boolean
}

/**
 * The parties a voter is likely to choose between in 2027, chosen by
 * on-record and shown with that disclosure (principle 7). Revised by hand
 * when the polls move: next after the PS primary of 17 October 2026.
 */
export const PRESIDENTIAL_RACE = {
  parties: [
    {
      groupBearsItsName: true,
      groupId: 'PO845401',
      id: 'rn',
      pollAverage: 34.1,
      sitsInAllyGroup: false
    },
    {
      groupBearsItsName: true,
      groupId: 'PO845470',
      id: 'horizons',
      pollAverage: 17.5,
      sitsInAllyGroup: false
    },
    {
      groupBearsItsName: false,
      groupId: 'PO845413',
      id: 'lfi',
      pollAverage: 16.3,
      sitsInAllyGroup: false
    },
    {
      groupBearsItsName: false,
      groupId: 'PO845407',
      id: 'renaissance',
      pollAverage: 11.5,
      sitsInAllyGroup: false
    },
    {
      groupBearsItsName: false,
      groupId: 'PO845419',
      id: 'placePublique',
      pollAverage: 11,
      sitsInAllyGroup: true
    }
  ],
  polls: {
    count: 20,
    from: '2026-07-07',
    sourceUrl:
      'https://fr.wikipedia.org/wiki/Liste_de_sondages_sur_l%27%C3%A9lection_pr%C3%A9sidentielle_fran%C3%A7aise_de_2027',
    to: '2026-09-29'
  },
  thresholdPercent: 10,
  updatedOn: '2026-10-01'
} as const satisfies {
  updatedOn: string
  thresholdPercent: number
  polls: { count: number; from: string; to: string; sourceUrl: string }
  parties: readonly RaceParty[]
}

/** The race party a group's positions speak for, if any. */
export const racePartyOfGroup = (groupId: OrganId): RaceParty | null =>
  PRESIDENTIAL_RACE.parties.find((party) => party.groupId === groupId) ?? null
