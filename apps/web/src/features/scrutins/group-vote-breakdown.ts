import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

/** How either chamber files one group's ballots on one scrutin. */
type GroupBallots<TBallot> = {
  ballots: readonly TBallot[]
  /** `null` on a tie or when no member voted. */
  majorityPosition: BallotPosition | null
  memberCount: number
}

/**
 * The members who voted otherwise than their group's majority: for, against
 * or abstaining. A non-voting member did not vote otherwise, and a group with
 * no majority has no one to dissent from.
 */
export const dissentersOf = <TBallot extends { position: BallotPosition }>(
  groupVote: GroupBallots<TBallot>
): TBallot[] =>
  groupVote.majorityPosition === null
    ? []
    : groupVote.ballots.filter(
        (ballot) =>
          ballot.position !== 'nonVoting' &&
          ballot.position !== groupVote.majorityPosition
      )

/** Members of the group on that day with no recorded vote. */
export const withoutVoteCountOf = (groupVote: GroupBallots<unknown>): number =>
  Math.max(0, groupVote.memberCount - groupVote.ballots.length)

/** The id of a group's entry in the breakdown, so a summary row can lead to it. */
export const groupAnchorOf = (groupId: string): string => `group-${groupId}`

export const groupsBySize = <TGroupVote extends { memberCount: number }>(
  groups: readonly TGroupVote[]
): TGroupVote[] =>
  groups.toSorted((first, second) => second.memberCount - first.memberCount)
