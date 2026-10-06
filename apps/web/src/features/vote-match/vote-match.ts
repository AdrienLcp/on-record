import type { MajorVote } from '@on-record/protocol/assembly/major-votes'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position'

import type { VoteMatchEntry } from './vote-match-selection'

/** What a visitor says they would have voted; `unsure` is never counted. */
export type MatchAnswer = 'abstention' | 'against' | 'for' | 'unsure'

export const MATCH_ANSWERS = [
  'for',
  'against',
  'abstention',
  'unsure'
] as const satisfies readonly MatchAnswer[]

/** One letter per answer in the URL, so a shared link stays short. */
const ANSWER_CODES = {
  abstention: 'a',
  against: 'c',
  for: 'p',
  unsure: 'n'
} as const satisfies Record<MatchAnswer, string>

const ANSWER_ENTRY = /^(\d+)([acnp])$/

const answerOfCode = (code: string): MatchAnswer | undefined =>
  MATCH_ANSWERS.find((answer) => ANSWER_CODES[answer] === code)

export type MatchAnswers = ReadonlyMap<number, MatchAnswer>

/** `8280p.8431c` reads "for" on scrutin 8280, "against" on 8431; anything else is dropped. */
export const parseAnswers = (value: string | null): MatchAnswers => {
  const answers = new Map<number, MatchAnswer>()

  for (const entry of (value ?? '').split('.')) {
    const [, number, code] = entry.match(ANSWER_ENTRY) ?? []
    const answer = code === undefined ? undefined : answerOfCode(code)

    if (number !== undefined && answer !== undefined) {
      answers.set(Number(number), answer)
    }
  }

  return answers
}

export const answersSearchValue = (
  answers: MatchAnswers
): string | undefined =>
  answers.size === 0
    ? undefined
    : [...answers]
        .map(([scrutin, answer]) => `${scrutin}${ANSWER_CODES[answer]}`)
        .join('.')

export const withAnswer = ({
  answer,
  answers,
  scrutin
}: {
  answer: MatchAnswer
  answers: MatchAnswers
  scrutin: number
}): MatchAnswers => new Map(answers).set(scrutin, answer)

/**
 * Where the visitor stands in the path:
 * - `intro` — nothing started
 * - `question` — the text at `index` in the selection
 * - `result` — their answers beside the parties' votes
 */
export type MatchStep =
  | { kind: 'intro' }
  | { index: number; kind: 'question' }
  | { kind: 'result' }

/** A question of the path with the vote that answers it. */
export type MatchedText = {
  entry: VoteMatchEntry
  vote: MajorVote
}

/** The selection in its own order; an entry with no vote in the data is left out. */
export const matchedTextsOf = ({
  entries,
  votes
}: {
  entries: readonly VoteMatchEntry[]
  votes: readonly MajorVote[]
}): MatchedText[] => {
  const voteByNumber = new Map(votes.map((vote) => [vote.number, vote]))

  return entries.flatMap((entry) => {
    const vote = voteByNumber.get(entry.scrutin)

    return vote === undefined ? [] : [{ entry, vote }]
  })
}

/**
 * A group's vote on a text: its majority position, `null` when it had none
 * (a tie, or no member voted), `undefined` when it did not sit that day.
 */
export const groupVoteOn = ({
  groupId,
  vote
}: {
  groupId: OrganId
  vote: MajorVote
}): BallotPosition | null | undefined =>
  vote.groups.find((group) => group.groupId === groupId)?.position

/** An answer the tally counts: for, against or abstaining. */
type CountedAnswer = Exclude<MatchAnswer, 'unsure'>

const isCounted = (answer: MatchAnswer | undefined): answer is CountedAnswer =>
  answer !== undefined && answer !== 'unsure'

/** The texts answered for, against or abstaining: the only ones a tally counts. */
export const countedTextsOf = ({
  answers,
  texts
}: {
  answers: MatchAnswers
  texts: readonly MatchedText[]
}): MatchedText[] =>
  texts.filter((text) => isCounted(answers.get(text.entry.scrutin)))

export const isSameChoice = ({
  answer,
  groupVote
}: {
  answer: MatchAnswer | undefined
  groupVote: BallotPosition | null | undefined
}): boolean => isCounted(answer) && answer === groupVote

/** On how many of the counted texts a group made the visitor's choice. */
export const sameChoiceCountOf = ({
  answers,
  groupId,
  texts
}: {
  answers: MatchAnswers
  groupId: OrganId
  texts: readonly MatchedText[]
}): number =>
  texts.filter((text) =>
    isSameChoice({
      answer: answers.get(text.entry.scrutin),
      groupVote: groupVoteOn({ groupId, vote: text.vote })
    })
  ).length
