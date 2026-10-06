import type { SenatorId } from '@on-record/protocol/senate/senate-ids.ts'
import type { SenateCorrection } from '@on-record/protocol/senate/senate-scrutin.ts'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position.ts'

/** A senator whose ballot carries the "mise au point" flag. */
export type FlaggedSenator = {
  /** First name then last name, as the Senate spells them. */
  fullName: string
  /** The group the senator sat in on the day, as the Senate names it: « Groupe Socialiste, … ». */
  groupName: string | null
  senatorId: SenatorId
}

const INTENDED_POSITION_WORDING: readonly [RegExp, BallotPosition][] = [
  [/voter pour/, 'for'],
  [/voter contre/, 'against'],
  [/s.abstenir/, 'abstention'],
  [/ne pas prendre part/, 'nonVoting']
]

/** Lowercase, no accents, hyphens and apostrophes as spaces: « Jean-Pierre » meets « Jean Pierre ». */
const comparable = (text: string): string =>
  ` ${text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim()} `

/** « les membres du groupe Socialiste, Écologiste et Républicain ont fait savoir… » */
const WHOLE_GROUP_WORDING = ' membres du groupe '

const namesWholeGroup = (sentence: string, groupName: string | null): boolean =>
  groupName !== null &&
  sentence.includes(
    `${WHOLE_GROUP_WORDING}${comparable(groupName.replace(/^Groupe /, '')).trim()} `
  )

const intendedPositionOf = (sentence: string): BallotPosition | null =>
  INTENDED_POSITION_WORDING.find(([wording]) => wording.test(sentence))?.[1] ??
  null

/**
 * The vote each flagged senator declared they meant, read from the sentence of
 * the official report that names them, or that speaks for their whole group. A flagged senator no sentence names,
 * or named in a sentence that states no position, is left out: never guessed.
 */
export const toSenateCorrections = ({
  flaggedSenators,
  sentences
}: {
  flaggedSenators: readonly FlaggedSenator[]
  sentences: readonly string[]
}): { corrections: SenateCorrection[]; unmatched: SenatorId[] } => {
  const readSentences = sentences.map((sentence) => ({
    intended: intendedPositionOf(comparable(sentence)),
    names: comparable(sentence)
  }))
  const corrections: SenateCorrection[] = []
  const unmatched: SenatorId[] = []
  for (const { fullName, groupName, senatorId } of flaggedSenators) {
    const intended = readSentences.findLast(
      (sentence) =>
        sentence.names.includes(comparable(fullName)) ||
        namesWholeGroup(sentence.names, groupName)
    )?.intended
    if (intended === undefined || intended === null) {
      unmatched.push(senatorId)
    } else {
      corrections.push({ intended, senatorId })
    }
  }
  return { corrections, unmatched }
}
