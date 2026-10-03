import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import {
  readingStageOf,
  type ScrutinTitle,
  scrutinTitleOf
} from '@/features/scrutins/scrutin-title'
import { searchableText } from '@/helpers/search-text'

import type { ComparedKind, PartyStance } from './party-comparison'

/** The name two readings of one text share, whatever the part voted. */
const textKeyOf = (title: string): string => {
  const parsed = scrutinTitleOf(title)

  return searchableText(
    parsed.kind === 'text'
      ? `${parsed.textKind} ${parsed.subject}`
      : parsed.kind === 'other'
        ? parsed.subject
        : title
  )
}

/** One text and the solemn votes it went through, oldest first. */
export type ComparedText = {
  readings: MajorVote[]
  /** The title its latest reading gives it. */
  title: ScrutinTitle
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
    const searchableName = textKeyOf(vote.title)
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
      readings,
      title: scrutinTitleOf(readings.at(-1)?.title ?? '')
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
    ? votes.map((vote) => ({
        readings: [vote],
        title: scrutinTitleOf(vote.title)
      }))
    : textsOf(votes)

/** What the "by text" view's tab for a kind lists: texts, not the votes on them. */
export const countTextsOfKind = ({
  kind,
  votes
}: {
  kind: ComparedKind
  votes: readonly MajorVote[]
}): number =>
  comparedTextsOf({ kind, votes: votes.filter((vote) => vote.kind === kind) })
    .length
