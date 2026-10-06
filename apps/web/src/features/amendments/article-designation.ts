/**
 * Where an amendment applies, read off the Assemblée's short designation
 * (`APRÈS ART. 3`, `ART. 1ER BIS`, `ART.S 3 TER À 3 OCTIES`, `TITRE`) so it can
 * be said in plain French.
 * - `article` — on an article, or before or after it to insert a new one;
 *   `designation` is the article's own name as the law writes it: `3`, `1er bis`,
 *   `3 bis A`, `premier`
 * - `title` — the title of the text
 * - `other` — a shape the parser does not know, kept word for word
 */
export type ArticleTarget =
  | {
      designation: string
      kind: 'article'
      placement: 'after' | 'before' | 'on'
      plural: boolean
    }
  | { kind: 'title' }
  | { kind: 'other'; text: string }

const PLACEMENT_BY_WORD = { APRÈS: 'after', AVANT: 'before' } as const

/** The letters that number inserted articles stay capitals: `3 bis A`, `2 AA`. */
const INSERTION_LETTERS = /^[A-Z]{1,2}$/

const lawWording = (designation: string): string =>
  designation
    .split(' ')
    .map((word) => (INSERTION_LETTERS.test(word) ? word : word.toLowerCase()))
    .join(' ')

/** A few records repeat the word or end on a colon: `ART. ARTICLE 2`, `ART. 64 :`. */
const ARTICLE_DESIGNATION =
  /^(?:(?<placement>APRÈS|AVANT) )?ART\.(?<plural>S)? (?:ARTICLE )?(?<designation>.+?)\s*:?$/u

export const parseArticleDesignation = (designation: string): ArticleTarget => {
  if (designation === 'TITRE') {
    return { kind: 'title' }
  }

  const groups = ARTICLE_DESIGNATION.exec(designation)?.groups

  if (groups?.designation === undefined) {
    return { kind: 'other', text: designation }
  }

  return {
    designation: lawWording(groups.designation),
    kind: 'article',
    placement:
      groups.placement === 'APRÈS' || groups.placement === 'AVANT'
        ? PLACEMENT_BY_WORD[groups.placement]
        : 'on',
    plural: groups.plural !== undefined
  }
}
