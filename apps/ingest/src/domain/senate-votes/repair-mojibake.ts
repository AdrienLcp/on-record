/**
 * The Senate stored some Windows-1252 punctuation as the C1 control
 * characters of the same byte: U+0092 where a typographic apostrophe was
 * typed.
 */
const WINDOWS_1252_BY_C1_CONTROL: Readonly<Record<string, string>> = {
  '\u008c': 'Œ',
  '\u009c': 'œ',
  '\u0080': '€',
  '\u0085': '…',
  '\u0091': '‘',
  '\u0092': '’',
  '\u0093': '“',
  '\u0094': '”',
  '\u0095': '•',
  '\u0096': '–',
  '\u0097': '—'
}

/** Puts back the punctuation the Senate's dumps hold as C1 control characters. */
export const repairMojibake = (text: string): string =>
  text.replace(
    /[\u0080-\u009f]/g,
    (control) => WINDOWS_1252_BY_C1_CONTROL[control] ?? ''
  )
