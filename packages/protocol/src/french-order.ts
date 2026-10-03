/** The records are written in French: names, communes and departments sort by its rules. */
const FRENCH_COLLATOR = new Intl.Collator('fr', { numeric: true })

/**
 * Orders two French texts for a sort: accents after their base letter, and
 * digits by value, so department `2A` precedes `10` and `Paris 2e` precedes
 * `Paris 10e`.
 */
export const compareFrench = (first: string, second: string): number =>
  FRENCH_COLLATOR.compare(first, second)
