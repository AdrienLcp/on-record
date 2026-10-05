/** Long enough to say what the amendment is for; the official page holds the rest. */
export const SUMMARY_MAX_LENGTH = 200

const ELLIPSIS = '…'

/** The named entities the amendments use; numeric ones are decoded from their code. */
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  laquo: '«',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  raquo: '»',
  rsquo: '’'
}

const decodeEntity = (entity: string, body: string): string => {
  if (body.startsWith('#x') || body.startsWith('#X')) {
    return String.fromCodePoint(Number.parseInt(body.slice(2), 16))
  }
  if (body.startsWith('#')) {
    return String.fromCodePoint(Number.parseInt(body.slice(1), 10))
  }
  return NAMED_ENTITIES[body] ?? entity
}

/** An amendment's HTML as one line of plain text. */
export const htmlToText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The start of the author's summary, cut on a word boundary. `null` when the
 * amendment has none: credit amendments of a budget bill often do not.
 */
export const toAmendmentSummary = (html: string | null): string | null => {
  if (html === null) return null
  const text = htmlToText(html)
  if (text === '') return null
  if (text.length <= SUMMARY_MAX_LENGTH) return text
  const cut = text.slice(0, SUMMARY_MAX_LENGTH)
  const lastSpace = cut.lastIndexOf(' ')
  const words = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  return `${words.replace(/[\s,;:.–-]+$/, '')}${ELLIPSIS}`
}
