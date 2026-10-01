import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'
import type { Group } from '@on-record/protocol/assembly/group'
import type {
  GroupStance,
  MajorVote
} from '@on-record/protocol/assembly/major-votes'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import type { PartyChoice } from '@/features/parties/party-selection'
import {
  PRESIDENTIAL_RACE,
  type RaceParty
} from '@/features/parties/presidential-race'
import { matchesQuery } from '@/helpers/search-text'

/** The votes the comparison lists: the ones people recognise. */
export type ComparedKind = 'censure' | 'solemn'

/** In the order the tabs show them. */
export const COMPARED_KINDS = [
  'solemn',
  'censure'
] as const satisfies readonly ComparedKind[]

const DEFAULT_COMPARED_KIND = 'solemn' satisfies ComparedKind

export const parseComparedKind = (value: string | null): ComparedKind =>
  COMPARED_KINDS.find((kind) => kind === value) ?? DEFAULT_COMPARED_KIND

/** The kind as the URL writes it: the default leaves no parameter. */
export const comparedKindSearchValue = (kind: ComparedKind): string | null =>
  kind === DEFAULT_COMPARED_KIND ? null : kind

/** The two ways to read the comparison, in the order the tabs show them. */
export const COMPARED_VIEWS = ['ledger', 'camps'] as const

/**
 * - `ledger` — one line per vote, one column per party
 * - `camps` — each vote with the parties filed under the side they took
 */
export type ComparedView = (typeof COMPARED_VIEWS)[number]

const DEFAULT_COMPARED_VIEW = 'ledger' satisfies ComparedView

export const parseComparedView = (value: string | null): ComparedView =>
  COMPARED_VIEWS.find((view) => view === value) ?? DEFAULT_COMPARED_VIEW

/** The view as the URL writes it: the default leaves no parameter. */
export const comparedViewSearchValue = (view: ComparedView): string | null =>
  view === DEFAULT_COMPARED_VIEW ? null : view

/**
 * Which votes to list by how the chosen groups stood:
 * - `all` — every vote
 * - `split` — those where they part ways
 * - `together` — those where they all took the same stance
 */
export type Agreement = 'all' | 'split' | 'together'

/** `ecart=1` lists the splits, `ecart=0` the votes with no gap between them. */
const AGREEMENT_SEARCH_VALUES = {
  all: null,
  split: '1',
  together: '0'
} as const satisfies Record<Agreement, string | null>

const AGREEMENTS = [
  'all',
  'split',
  'together'
] as const satisfies readonly Agreement[]

export const parseAgreement = (value: string | null): Agreement =>
  AGREEMENTS.find(
    (agreement) => AGREEMENT_SEARCH_VALUES[agreement] === value
  ) ?? 'all'

export const agreementSearchValue = (agreement: Agreement): string | null =>
  AGREEMENT_SEARCH_VALUES[agreement]

/** A compared party and the group it votes through, when the data has it. */
export type ComparedParty = {
  group: Group | undefined
  party: RaceParty
}

/** The race parties chosen in the URL; none chosen compares them all. */
export const comparedPartiesOf = (
  choices: readonly PartyChoice[]
): RaceParty[] => {
  const chosen = PRESIDENTIAL_RACE.parties.filter((party) =>
    choices.includes(party.id)
  )

  return chosen.length === 0 ? [...PRESIDENTIAL_RACE.parties] : chosen
}

/**
 * Where a party's group stood on one vote:
 * - a ballot position, or `none` when the Assemblée published no position
 * - on a motion of censure, where only "for" is recorded: `backed` by more
 *   than half its members, `someVoices`, or `notBacked`
 * - `notListed` when the group did not sit that day
 */
export type PartyStance =
  | BallotPosition
  | 'backed'
  | 'none'
  | 'notBacked'
  | 'notListed'
  | 'someVoices'

export type PartyStanceOnVote = {
  /** The group's stance as published; `null` when it was not listed. */
  record: GroupStance | null
  stance: PartyStance
}

const censureStanceOf = (record: GroupStance): PartyStance => {
  if (record.totals.for * 2 > record.memberCount) {
    return 'backed'
  }

  return record.totals.for > 0 ? 'someVoices' : 'notBacked'
}

export const partyStanceOn = ({
  groupId,
  vote
}: {
  groupId: OrganId
  vote: MajorVote
}): PartyStanceOnVote => {
  const record = vote.groups.find((group) => group.groupId === groupId) ?? null

  if (record === null) {
    return { record, stance: 'notListed' }
  }

  return {
    record,
    stance:
      vote.kind === 'censure'
        ? censureStanceOf(record)
        : (record.position ?? 'none')
  }
}

/** True when the groups did not all take the same stance. */
export const groupsDiffer = ({
  groupIds,
  vote
}: {
  groupIds: readonly OrganId[]
  vote: MajorVote
}): boolean =>
  new Set(groupIds.map((groupId) => partyStanceOn({ groupId, vote }).stance))
    .size > 1

export type ComparisonFilters = {
  agreement: Agreement
  kind: ComparedKind
  query: string
}

type ComparedVotes = {
  matching: MajorVote[]
  shown: MajorVote[]
  split: MajorVote[]
  together: MajorVote[]
}

/**
 * The votes of the chosen kind matching the search, newest first; those
 * where the groups part ways, those where they all stood together; and the
 * list to show once the agreement filter applies.
 */
export const compareVotes = ({
  filters,
  groupIds,
  votes
}: {
  filters: ComparisonFilters
  groupIds: readonly OrganId[]
  votes: readonly MajorVote[]
}): ComparedVotes => {
  const matching = votes
    .filter(
      (vote) =>
        vote.kind === filters.kind &&
        matchesQuery({ query: filters.query, text: vote.title })
    )
    .toSorted((first, second) => second.number - first.number)
  const split = matching.filter((vote) => groupsDiffer({ groupIds, vote }))
  const together = matching.filter((vote) => !split.includes(vote))
  const shownBy = { all: matching, split, together } as const satisfies Record<
    Agreement,
    MajorVote[]
  >

  return { matching, shown: shownBy[filters.agreement], split, together }
}

export const countVotesOfKind = ({
  kind,
  votes
}: {
  kind: ComparedKind
  votes: readonly MajorVote[]
}): number => votes.filter((vote) => vote.kind === kind).length

/** The sides a camp can stand for, in the vote bars' diverging order. */
export const CAMP_STANCES = {
  censure: ['backed', 'someVoices', 'notBacked'],
  solemn: ['for', 'abstention', 'against']
} as const satisfies Record<ComparedKind, readonly PartyStance[]>

export type Camp = {
  parties: ComparedParty[]
  stance: PartyStance
}

export type CampsOnVote = {
  camps: Camp[]
  /** The parties whose group took none of the camps' stances: no position, not voting, not sitting. */
  aside: { party: ComparedParty; stance: PartyStance }[]
}

/** Every compared party filed under the stance its group took on the vote. */
export const campsOn = ({
  kind,
  parties,
  vote
}: {
  kind: ComparedKind
  parties: readonly ComparedParty[]
  vote: MajorVote
}): CampsOnVote => {
  const stances = parties.map((party) => ({
    party,
    stance: partyStanceOn({ groupId: party.party.groupId, vote }).stance
  }))
  const campStances: readonly PartyStance[] = CAMP_STANCES[kind]

  return {
    aside: stances.filter(({ stance }) => !campStances.includes(stance)),
    camps: campStances.map((stance) => ({
      parties: stances
        .filter((each) => each.stance === stance)
        .map((each) => each.party),
      stance
    }))
  }
}
