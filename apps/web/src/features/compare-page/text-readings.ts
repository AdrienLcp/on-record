import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { searchableText } from '@/helpers/search-text'

import type { ComparedKind, PartyStance } from './party-comparison'

/**
 * Where a text stood in the parliamentary shuttle when the Assemblée voted it:
 * - `firstReading`, `secondReading` — each chamber's first and second pass
 * - `newReading` — after the two chambers failed to agree
 * - `jointCommittee` — the compromise of deputies and senators (CMP)
 * - `finalReading` — the Assemblée's last word over the Senate's
 */
export type ReadingStage =
  | 'finalReading'
  | 'firstReading'
  | 'jointCommittee'
  | 'newReading'
  | 'secondReading'

/** The stage the official title closes on, in parentheses. */
const STAGE_PATTERNS: readonly [RegExp, ReadingStage][] = [
  [/\(première lecture\)/, 'firstReading'],
  [/\(deuxième lecture\)/, 'secondReading'],
  [/\(nouvelle lecture\)/, 'newReading'],
  [/\(lecture définitive\)/, 'finalReading'],
  [/\(texte de la commission mixte paritaire\)/, 'jointCommittee']
]

const STAGE_SUFFIX =
  /\s*\((première lecture|deuxième lecture|nouvelle lecture|lecture définitive|texte de la commission mixte paritaire)\)/
const APPLIED_ARTICLE = /\s*\(application de l'article [^)]*\)/
/** What the title says was voted, before the text's own name. */
const VOTED_PART =
  /^(l'ensemble (du |de la |de l'|des )|la première partie du |l'article unique de la |la )/

const plainTitle = (title: string): string =>
  title.replaceAll('’', "'").replace(/\s+/g, ' ').trim()

export const readingStageOf = (title: string): ReadingStage | null => {
  const plain = plainTitle(title)

  return STAGE_PATTERNS.find(([pattern]) => pattern.test(plain))?.[1] ?? null
}

/**
 * The text a scrutin voted on, named as a reader would look it up:
 * `l'ensemble du projet de loi spéciale … (première lecture).` reads
 * `Projet de loi spéciale …`.
 */
export const textNameOf = (title: string): string => {
  const name = plainTitle(title)
    .replace(STAGE_SUFFIX, '')
    .replace(APPLIED_ARTICLE, '')
    .replace(/\.$/, '')
    .replace(VOTED_PART, '')

  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** One text and the solemn votes it went through, oldest first. */
export type ComparedText = {
  /** The name its latest reading gives it. */
  name: string
  readings: MajorVote[]
}

type TextInProgress = {
  fileIds: Set<string>
  readings: MajorVote[]
  searchableName: string
}

/** Same file, or the same name with no file telling them apart. */
const continuesText = ({
  searchableName,
  text,
  vote
}: {
  searchableName: string
  text: TextInProgress
  vote: MajorVote
}): boolean => {
  const fileId = vote.legislativeFileId

  if (fileId !== null && text.fileIds.has(fileId)) {
    return true
  }

  const otherFile = fileId !== null && text.fileIds.size > 0

  return text.searchableName === searchableName && !otherFile
}

/**
 * The solemn votes filed under the text they voted on, the text with the
 * latest reading first. Readings join by legislative file when both have one
 * (which also absorbs a typo between two titles), by name otherwise; a first
 * reading always opens a new text, so the special budget laws of 2024 and
 * 2025 stay apart.
 */
export const textsOf = (votes: readonly MajorVote[]): ComparedText[] => {
  const texts: TextInProgress[] = []

  for (const vote of votes.toSorted((a, b) => a.number - b.number)) {
    const searchableName = searchableText(textNameOf(vote.title))
    const opensText = readingStageOf(vote.title) === 'firstReading'
    const text = opensText
      ? undefined
      : texts.findLast((each) =>
          continuesText({ searchableName, text: each, vote })
        )

    if (text === undefined) {
      texts.push({
        fileIds: new Set(
          vote.legislativeFileId === null ? [] : [vote.legislativeFileId]
        ),
        readings: [vote],
        searchableName
      })
    } else {
      text.readings.push(vote)
      if (vote.legislativeFileId !== null) {
        text.fileIds.add(vote.legislativeFileId)
      }
    }
  }

  return texts
    .map(({ readings }) => ({
      name: textNameOf(readings.at(-1)?.title ?? ''),
      readings
    }))
    .toSorted(
      (first, second) =>
        (second.readings.at(-1)?.number ?? 0) -
        (first.readings.at(-1)?.number ?? 0)
    )
}

/** The stances that are a side taken on the text. */
type DecidedStance = 'abstention' | 'against' | 'for'

const isDecided = (stance: PartyStance | undefined): stance is DecidedStance =>
  stance === 'abstention' || stance === 'against' || stance === 'for'

/**
 * The stance a party left behind since the text's previous reading, when it
 * moved from one side to another; `null` otherwise. Not sitting or having no
 * position is not a change of mind.
 */
export const stanceLeftBehind = ({
  current,
  previous
}: {
  current: PartyStance
  previous: PartyStance | undefined
}): DecidedStance | null =>
  isDecided(previous) && isDecided(current) && previous !== current
    ? previous
    : null

/** The entries the text view lists: texts for solemn votes, each motion alone for censure. */
export const comparedTextsOf = ({
  kind,
  votes
}: {
  kind: ComparedKind
  votes: readonly MajorVote[]
}): ComparedText[] =>
  kind === 'censure'
    ? votes.map((vote) => ({ name: vote.title, readings: [vote] }))
    : textsOf(votes)

const CENSURE_AUTHORS = /,? par (.+?)\.?$/
const CIVILITY = /\b(M\.|Mmes?) /g

/** A motion of censure as its title files it: after a 49.3 or not, and who tabled it. */
export const censureMotionOf = (
  title: string
): { afterForcedAdoption: boolean; authors: string } => {
  const plain = plainTitle(title)

  return {
    afterForcedAdoption: /alinéa 3/.test(plain),
    authors: (plain.match(CENSURE_AUTHORS)?.[1] ?? '').replace(CIVILITY, '')
  }
}
