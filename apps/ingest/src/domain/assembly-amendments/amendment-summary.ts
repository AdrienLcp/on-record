import { decodeHTML } from 'entities'

/** Long enough to say what the amendment is for; the official page holds the rest. */
export const SUMMARY_MAX_LENGTH = 200

const ELLIPSIS = '…'

/** An amendment's HTML as one line of plain text. */
export const htmlToText = (html: string): string =>
  decodeHTML(html.replace(/<[^>]*>/g, ' '))
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
