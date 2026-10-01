import type { ScrutinKind } from '@on-record/protocol/assembly/scrutin'

/**
 * What a scrutin decided, as its official title words it:
 * - `amendment` — an amendment or a sub-amendment: one change to a passage
 * - `article` — one article of a text
 * - `wholeText` — a text as a whole, or a resolution
 * - `textPart` — one part of a budget bill
 * - `rejectionMotion` — a motion to reject a text before examining it
 * - `censure` — a motion of censure against the government
 * - `governmentDeclaration` — a statement of the government put to a vote
 * - `procedural` — the conduct of the sitting: a suspension, a second deliberation
 * - `other` — none of the above can be told from the title
 */
export type VoteObject =
  | 'amendment'
  | 'article'
  | 'censure'
  | 'governmentDeclaration'
  | 'other'
  | 'procedural'
  | 'rejectionMotion'
  | 'textPart'
  | 'wholeText'

/** Tried in order, against the title's start, lowercased and with straight apostrophes. */
const TITLE_PATTERNS: readonly [RegExp, VoteObject][] = [
  [/^(sur )?la motion de censure/, 'censure'],
  [/^(sur )?la motion de rejet/, 'rejectionMotion'],
  [/^(l'|le |les )(sous-)?amen/, 'amendment'],
  [/^l'article/, 'article'],
  [/^l'ensemble/, 'wholeText'],
  [/^la proposition de résolution/, 'wholeText'],
  [/^la (première|deuxième|troisième|quatrième) partie/, 'textPart'],
  [
    /^la déclaration (de politique générale )?du gouvernement/,
    'governmentDeclaration'
  ],
  [/^la demande de (suspension|seconde délibération)/, 'procedural'],
  [/^la proposition du gouvernement de prolonger/, 'procedural']
]

const comparableTitle = (title: string): string =>
  title.trim().toLowerCase().replaceAll('’', "'")

/**
 * The kind of decision a scrutin took, read off its official title: a vote on
 * an amendment is not a vote on the text. A motion of censure is told by the
 * scrutin's own kind first.
 */
export const voteObjectOf = ({
  kind,
  title
}: {
  kind: ScrutinKind
  title: string
}): VoteObject => {
  if (kind === 'censure') {
    return 'censure'
  }

  const comparable = comparableTitle(title)

  return (
    TITLE_PATTERNS.find(([pattern]) => pattern.test(comparable))?.[1] ?? 'other'
  )
}
