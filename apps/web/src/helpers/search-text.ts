import { withoutAccents } from '@on-record/protocol/without-accents'

const NOT_LETTER_OR_DIGIT = /[^\p{L}\p{N}]+/gu

/**
 * Text as a search compares it: no case, no accents, punctuation and runs of
 * spaces as one space — so `lefevre` finds `Lefèvre` and `jean pierre`
 * finds `Jean-Pierre`.
 */
export const searchableText = (text: string): string =>
  withoutAccents(text).toLowerCase().replace(NOT_LETTER_OR_DIGIT, ' ').trim()

/** Every word of the query appears in the text, in any order. */
export const matchesQuery = ({
  query,
  text
}: {
  query: string
  text: string
}): boolean => {
  const words = searchableText(query).split(' ').filter(Boolean)
  const searchable = searchableText(text)

  return words.every((word) => searchable.includes(word))
}
