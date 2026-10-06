import type { ScrutinKind } from '@on-record/protocol/votes/scrutin-kind'

import {
  type ScrutinTitle,
  scrutinTitleOf
} from '@/features/scrutins/scrutin-title'
import { type VoteObject, voteObjectOf } from '@/features/scrutins/vote-object'

/**
 * Who tabled or took up an amendment or a motion: names, never what the vote
 * decided. The Senate sometimes drops the « par » or the comma.
 */
const TABLED_BY =
  /(?:,? (?:présentée?|reprise?)(?: par)?| au nom de) .+?(?=,? (?:et )?n° |, (?:à |au |aux |de l'article|des articles)|,? (?:sur les crédits|tendant))/g

/** The last of a list of identical amendments, with no comma before « et ». */
const LAST_LISTED = /, et n° /g

/** The comma the Senate keeps between an amendment and what it changes. */
const BEFORE_TARGET =
  /(\d[^,]*?|la demande de seconde délibération), (?=à |au |aux |sur les crédits|tendant|de l'article)/g

/** The motions the Senate names by number, with what each asks. */
const MOTIONS: readonly [RegExp, string][] = [
  [
    /^la motion (n° [^,]+?),? tendant à opposer la question préalable (au |à la |à l'|aux )/,
    'la motion de rejet $1 (question préalable) '
  ],
  [
    /^la motion (n° [^,]+?),? tendant à opposer l'exception d'irrecevabilité (au |à la |à l'|aux |sur la |sur le |sur l')/,
    "la motion de rejet $1 (exception d'irrecevabilité) "
  ],
  [
    /^la motion préjudicielle (n° [^,]+?),? tendant à suspendre le débat (sur la |sur le |sur l')/,
    'la motion préjudicielle $1 '
  ],
  [
    /^la motion (n° [^,]+?),? tendant au renvoi en commission (du |de la |de l'|des )/,
    'la motion de renvoi en commission $1 '
  ]
]

/** `au projet` → `du projet`: the text a motion targets, worded as a vote on it. */
const MOTION_TARGET: Readonly<Record<string, string>> = {
  'au ': 'du ',
  'aux ': 'des ',
  "sur l'": "de l'",
  'sur la ': 'de la ',
  'sur le ': 'du ',
  "à l'": "de l'",
  'à la ': 'de la '
}

const JOINT_COMMITTEE =
  /^l'ensemble du texte élaboré par la commission mixte paritaire (?:sur )?/
const SINGLE_ARTICLE_TEXT = /^l'article unique constituant /
const RESOLUTION_BASIS = / en application de l'article 34-1 de la Constitution,/
const BUDGET_STATEMENT = / figurant à l'état [A-Z]/

const withMotionWording = (words: string): string =>
  MOTIONS.reduce(
    (current, [pattern, wording]) =>
      current.replace(
        pattern,
        (_whole, number: string, target: string) =>
          `${wording.replace('$1', number)}${MOTION_TARGET[target] ?? target}`
      ),
    words
  )

/** The text a joint committee agreed on, worded as the Assemblée files it. */
const withJointCommitteeWording = (words: string): string => {
  if (!JOINT_COMMITTEE.test(words)) {
    return words
  }

  const text = words.replace(JOINT_COMMITTEE, '')
  const linkedText = text.startsWith('la ')
    ? `de ${text}`
    : text.replace(/^le /, 'du ')

  return `l'ensemble ${linkedText} (texte de la commission mixte paritaire)`
}

/**
 * A Senate title worded the way the Assemblée words its own, so one parser
 * reads both: `sur l'amendement n° 12, présenté par M. X, à l'article 2 de la
 * proposition de loi…` reads `l'amendement n° 12 à l'article 2 de la
 * proposition de loi…`. The official title stays quoted on the scrutin page.
 */
export const assemblyWordingOf = (senateTitle: string): string =>
  withJointCommitteeWording(
    withMotionWording(
      senateTitle
        .replaceAll('’', "'")
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^sur /, '')
        .replace(TABLED_BY, '')
        .replace(/,+/g, ',')
        .replace(LAST_LISTED, ' et n° ')
        .replace(BEFORE_TARGET, '$1 ')
        .replace(RESOLUTION_BASIS, '')
        .replace(BUDGET_STATEMENT, '')
        .replace('loi-cadre', 'loi')
        .replace(SINGLE_ARTICLE_TEXT, '')
    )
  )

export const senateScrutinTitleOf = (senateTitle: string): ScrutinTitle =>
  scrutinTitleOf(assemblyWordingOf(senateTitle))

/** What a Senate vote decided; the Senate votes no motion of censure. */
export type SenateVoteObject = Exclude<VoteObject, 'censure'>

export const senateVoteObjectOf = ({
  kind,
  title
}: {
  kind: ScrutinKind
  title: string
}): SenateVoteObject => {
  const object = voteObjectOf({ kind, title: assemblyWordingOf(title) })

  return object === 'censure' ? 'other' : object
}
