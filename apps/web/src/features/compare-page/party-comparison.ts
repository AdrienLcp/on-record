import type { BallotPosition } from '@on-record/protocol/assembly/ballot-position'
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
  kind: ComparedKind
  onlySplit: boolean
  query: string
}

/**
 * The votes of the chosen kind matching the search, newest first; those
 * where the groups part ways; and the list to show once `onlySplit` applies.
 */
export const compareVotes = ({
  filters,
  groupIds,
  votes
}: {
  filters: ComparisonFilters
  groupIds: readonly OrganId[]
  votes: readonly MajorVote[]
}): { matching: MajorVote[]; shown: MajorVote[]; split: MajorVote[] } => {
  const matching = votes
    .filter(
      (vote) =>
        vote.kind === filters.kind &&
        matchesQuery({ query: filters.query, text: vote.title })
    )
    .toSorted((first, second) => second.number - first.number)
  const split = matching.filter((vote) => groupsDiffer({ groupIds, vote }))

  return { matching, shown: filters.onlySplit ? split : matching, split }
}

export const countVotesOfKind = ({
  kind,
  votes
}: {
  kind: ComparedKind
  votes: readonly MajorVote[]
}): number => votes.filter((vote) => vote.kind === kind).length
