import { i18n } from './i18n'
import { LOCALE } from './locale'
import type { Translate } from './translation'

const MONTH_STARTS = 'janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc'

/**
 * `Intl` prints the first of a month as « 1 octobre », where French writes the
 * ordinal « 1er octobre ». The space before the month may be a no-break one.
 */
const FIRST_OF_MONTH = new RegExp(
  `(?<!\\d)1(?=[ \\u00a0\\u202f](?:${MONTH_STARTS}))`,
  'gu'
)

const withOrdinalFirstOfMonth = (text: string): string =>
  text.replace(FIRST_OF_MONTH, '1er')

const translator = i18n.translator(LOCALE)

/** Every key is checked at the `Translate` call site; here one only passes it on. */
const translateAnyKey = translator as (key: string, values?: object) => string

const translateMessage = (key: string, values?: object): string =>
  withOrdinalFirstOfMonth(translateAnyKey(key, values))

const translateRich: Translate['rich'] = (key, values) =>
  translator
    .rich(key, values)
    .map((piece) =>
      typeof piece === 'string' ? withOrdinalFirstOfMonth(piece) : piece
    )

/** The site's one translator, with French date typography `Intl` leaves out. */
export const translate: Translate = Object.assign(translateMessage, {
  rich: translateRich
})
