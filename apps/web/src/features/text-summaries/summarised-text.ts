import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { FR_DICTIONARY } from '@/presentation/i18n/dictionary-fr'

/** A legislative file whose text on-record summarised in plain words. */
export type SummarisedFileId = keyof typeof FR_DICTIONARY.textSummaries.texts

const isSummarised = (fileId: string): fileId is SummarisedFileId =>
  Object.hasOwn(FR_DICTIONARY.textSummaries.texts, fileId)

/**
 * Solemn votes the Assemblée's open data ties to no legislative file, with
 * the file each one's text page names.
 */
const FILES_OF_UNFILED_SCRUTINS: Readonly<Record<number, SummarisedFileId>> = {
  844: 'DLR5L16N49726',
  1194: 'DLR5L17N50169',
  1195: 'DLR5L17N51078',
  2957: 'DLR5L17N50819',
  2958: 'DLR5L17N51429'
}

/**
 * The summarised file the readings of one text belong to, the latest reading
 * first: an early reading may have been voted before the Assemblée published
 * its file.
 */
export const summarisedFileOf = (
  readings: readonly Pick<MajorVote, 'legislativeFileId' | 'number'>[]
): SummarisedFileId | null =>
  readings
    .map(
      (reading) =>
        reading.legislativeFileId ?? FILES_OF_UNFILED_SCRUTINS[reading.number]
    )
    .findLast(
      (fileId): fileId is SummarisedFileId =>
        fileId !== null && fileId !== undefined && isSummarised(fileId)
    ) ?? null

/** `DLR5L16N49364` was opened under the 16th legislature, whatever votes it since. */
export const legislatureOfFile = (fileId: SummarisedFileId): number =>
  Number(/^DLR5L(?<legislature>\d+)N/u.exec(fileId)?.groups?.legislature)

/** The words of a file's summary, for a search to find a text by what it changes. */
export const summaryWordsOf = (
  vote: Pick<MajorVote, 'legislativeFileId' | 'number'>
): string => {
  const fileId = summarisedFileOf([vote])

  if (fileId === null) {
    return ''
  }

  const { summary, title } = FR_DICTIONARY.textSummaries.texts[fileId]

  return `${title} ${summary}`
}
