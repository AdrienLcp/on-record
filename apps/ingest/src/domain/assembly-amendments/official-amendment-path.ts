/**
 * The text and budget-bill part an amendment uid encodes:
 * `AMANR5L17PO420120B2851P0D1N000002` → text `2851`, part `0`. Committee texts
 * write `BTC` before the number.
 */
const TEXT_IN_UID = /B(?:TC)?(\d+)P(\d)D/

/** A budget bill's parts: the official page suffixes the text number with a letter. */
const PART_SUFFIX: Readonly<Record<string, string>> = { '1': 'A', '2': 'C' }

/** `I-2194` and `II-CF615` name the budget-bill part, which the page path carries instead. */
const PART_PREFIX = /^I{1,2}-/

/** `89 (Rect)`, `12 (2ème Rect)`: the official page drops the rectification. */
const RECTIFICATION = /\s*\(.*\)$/

/** An amendment number without its part prefix or rectification: what a scrutin title cites. */
export const bareAmendmentNumber = (number: string): string =>
  number.replace(PART_PREFIX, '').replace(RECTIFICATION, '')

/**
 * Path of the official page below `/dyn/<legislature>/amendements/`:
 * `<text><part>/<organ>/<number>`, e.g. `1906A/AN/2194` for `I-2194`.
 * `null` when the uid does not hold a text number.
 */
export const officialAmendmentPath = ({
  number,
  organ,
  uid
}: {
  number: string
  organ: string
  uid: string
}): string | null => {
  const match = uid.match(TEXT_IN_UID)
  const text = match?.[1]
  const part = match?.[2]
  if (text === undefined || part === undefined) return null
  return `${text}${PART_SUFFIX[part] ?? ''}/${organ}/${bareAmendmentNumber(number)}`
}
