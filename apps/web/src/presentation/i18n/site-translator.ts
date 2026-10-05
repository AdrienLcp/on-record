import type {
  LeafAt,
  ParameterizedKey,
  PlainKey,
  ValuesFor
} from '@adrienlcp/i18n'

import type { FR_DICTIONARY } from './dictionary-fr'
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

type Reference = typeof FR_DICTIONARY

/** A plain key alone, or a parameterized key with its values: the length picks `translator`'s overload. */
type Message =
  | [key: PlainKey<Reference>]
  | [
      key: ParameterizedKey<Reference>,
      values: ValuesFor<LeafAt<Reference, ParameterizedKey<Reference>>>
    ]

const translateMessage = (...message: Message): string =>
  withOrdinalFirstOfMonth(
    message.length === 1
      ? translator(message[0])
      : translator(message[0], message[1])
  )

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
