import type { DotPath, PlainKey, Translator } from '@adrienlcp/i18n'

import type { DatasetError } from '@/infrastructure/api/datasets-api'

import type { FR_DICTIONARY } from './dictionary-fr'

export type TranslationKey = DotPath<typeof FR_DICTIONARY>

export type PlainTranslationKey = PlainKey<typeof FR_DICTIONARY>

export type Translate = Translator<typeof FR_DICTIONARY>

/** An abort is never shown, so it has no message. */
export type ShownDatasetError = Exclude<DatasetError, 'aborted'>

export const datasetErrorKey = (
  error: ShownDatasetError
): `error.dataset.${ShownDatasetError}` => `error.dataset.${error}`
