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

/**
 * Who tabled the text and what kind of law it makes: a `bill` comes from the
 * government (projet de loi), a `memberBill` from deputies or senators
 * (proposition de loi).
 */
export type TextKind =
  | 'bill'
  | 'constitutionalBill'
  | 'constitutionalMemberBill'
  | 'europeanResolution'
  | 'memberBill'
  | 'organicBill'
  | 'organicMemberBill'
  | 'resolution'

/**
 * An official title split for a reader who scans a list:
 * - `text` — a vote on a text or a part of it: what the text is about (`null`
 *   for the special law, whose title names no subject but the law itself), its
 *   kind, which part of it was voted (`null` for the whole text), the stage,
 *   and whether the vote was taken again in a second deliberation
 * - `censure` — a motion of censure: whether it answers a 49.3, and who tabled it
 * - `other` — a title naming no text, such as a government declaration
 */
export type ScrutinTitle =
  | {
      isSecondDeliberation: boolean
      kind: 'text'
      stage: ReadingStage | null
      subject: string | null
      textKind: TextKind
      votedPart: string | null
    }
  | { afterForcedAdoption: boolean; authors: string; kind: 'censure' }
  | { kind: 'other'; subject: string }

const STAGES: readonly [string, ReadingStage][] = [
  ['première lecture', 'firstReading'],
  ['deuxième lecture', 'secondReading'],
  ['nouvelle lecture', 'newReading'],
  ['lecture définitive', 'finalReading'],
  ['texte de la commission mixte paritaire', 'jointCommittee']
]

const STAGE_SUFFIX = new RegExp(
  `\\s*\\((${STAGES.map(([words]) => words).join('|')})\\)`
)
const APPLIED_ARTICLE = /\s*\(application de l'article [^)]*\)/
const PRIORITY_EXAMINATION = /\s*\(examen prioritaire\)/g
const SECOND_DELIBERATION = /\s*\(seconde délibération\)/

const TEXT_KINDS: Readonly<Record<string, TextKind>> = {
  'projet loi': 'bill',
  'projet loi constitutionnelle': 'constitutionalBill',
  'projet loi organique': 'organicBill',
  'proposition loi': 'memberBill',
  'proposition loi constitutionnelle': 'constitutionalMemberBill',
  'proposition loi organique': 'organicMemberBill',
  'proposition résolution': 'resolution',
  'proposition résolution européenne': 'europeanResolution'
}

/** The first text the title names, with the article that ties it to what precedes. */
const TEXT_REFERENCE =
  /(?:^|\s)(?:(?:du|de la|des|la|le) |de l'|l')?(projet|proposition) de (loi|résolution)(?: (organique|constitutionnelle|européenne))?(?=[\s,.]|$)/

/** What was voted when the text was voted as a whole. */
const WHOLE_TEXT = /^(l'ensemble)?$/

/** The kinds of law named after their genre: "de finances", "d'urgence". */
const NAMED_LAW =
  /^(de |d')(approbation|finances|financement|fin de gestion|orientation|programmation|règlement|urgence)\b/
const SPECIAL_LAW = /^spéciale\b/
/**
 * The words that only tie a text to its subject: "visant à", "relative au",
 * "portant", "sur". A verb that says what the text does ("créant",
 * "permettant") stays.
 */
const LINKING_WORDS =
  /^(?:(?:actualisant|apportant|appelant|autorisant|portant|relatifs?|relatives?|tendant|visant) (?:à |au |aux )?|sur |de |d')/
/** The constitutional basis a resolution names: law, not subject. */
const RESOLUTION_BASIS = /\s*\((?:art\.|article) 34-1 de la Constitution\)/
const LEADING_ARTICLE = /^(?:la |le |les |l')/
/** An article that opens a subject once its linking words are gone. */
const SUBJECT_ARTICLE = /^(?:la |le |les |l'|un |une |des )/
/**
 * The same preposition repeated down a list once the first one is gone:
 * "à l'organisation, à la gestion et au financement".
 */
const LISTED_AT = /(,| et) (?:à la |à l'|à |au |aux )/g
const LEADING_AT = /^(?:à |au |aux )/

const CENSURE_AUTHORS = /,? par (.+?)\.?$/
const CIVILITY = /\b(M\.|Mmes?) /g

const plainTitle = (title: string): string =>
  title.replaceAll('’', "'").replace(/\s+/g, ' ').trim()

const capitalised = (words: string): string =>
  words.charAt(0).toUpperCase() + words.slice(1)

/** The stage the official title closes on, in parentheses. */
export const readingStageOf = (title: string): ReadingStage | null => {
  const words = plainTitle(title).match(STAGE_SUFFIX)?.[1]

  return STAGES.find(([each]) => each === words)?.[1] ?? null
}

/** The title without its stage, the article a declaration applies, nor its full stop. */
const coreOf = (title: string): string =>
  plainTitle(title)
    .replace(STAGE_SUFFIX, '')
    .replace(APPLIED_ARTICLE, '')
    .replace(PRIORITY_EXAMINATION, '')
    .replace(RESOLUTION_BASIS, '')
    .replace(SECOND_DELIBERATION, '')
    .replace(/\.$/, '')
    .trim()

/**
 * What a text is about, from the words after its kind:
 * `visant à moderniser la gestion…` reads `Moderniser la gestion…`, and
 * `de finances pour 2026` reads `Loi de finances pour 2026`. The special law
 * reads `null`: the interface names it.
 */
export const subjectOf = (afterKind: string): string | null => {
  const words = afterKind.trim()

  if (SPECIAL_LAW.test(words)) {
    return null
  }

  if (NAMED_LAW.test(words)) {
    return `Loi ${words}`
  }

  const unlinked = words.replace(LINKING_WORDS, '')
  const subject =
    unlinked === words
      ? words
      : unlinked
          .replace(LEADING_AT, '')
          .replace(SUBJECT_ARTICLE, '')
          .replace(LISTED_AT, '$1 ')

  return capitalised(subject)
}

const votedPartOf = (beforeText: string): string | null => {
  const part = beforeText.replace(/,$/, '').trim()

  return WHOLE_TEXT.test(part)
    ? null
    : capitalised(part.replace(LEADING_ARTICLE, ''))
}

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

const isCensureTitle = (core: string): boolean =>
  /^(la )?motion de censure/.test(core)

/**
 * An official title as a list shows it: the subject first, then the kind of
 * text and the part voted. `l'ensemble de la proposition de loi visant à
 * moderniser la gestion du patrimoine immobilier de l'État (texte de la
 * commission mixte paritaire).` reads `Moderniser la gestion du patrimoine
 * immobilier de l'État`, a member's bill, voted whole, at the CMP stage.
 */
export const scrutinTitleOf = (title: string): ScrutinTitle => {
  const core = coreOf(title)

  if (isCensureTitle(core)) {
    return { kind: 'censure', ...censureMotionOf(title) }
  }

  const reference = core.match(TEXT_REFERENCE)
  const textKind =
    reference === null
      ? undefined
      : TEXT_KINDS[
          [reference[1], reference[2], reference[3]]
            .filter((word) => word !== undefined)
            .join(' ')
        ]

  if (reference === null || textKind === undefined) {
    return {
      kind: 'other',
      subject: capitalised(core.replace(LEADING_ARTICLE, ''))
    }
  }

  const referenceStart = reference.index ?? 0

  return {
    isSecondDeliberation: SECOND_DELIBERATION.test(plainTitle(title)),
    kind: 'text',
    stage: readingStageOf(title),
    subject: subjectOf(core.slice(referenceStart + reference[0].length)),
    textKind,
    votedPart: votedPartOf(core.slice(0, referenceStart))
  }
}
