import { HATVP_SOURCE_ID } from '@on-record/protocol/hatvp/hatvp-source.ts'

import type { OpenDataSource } from '@/domain/open-data-source.ts'

const HATVP_ORIGIN = 'https://www.hatvp.fr'

/** The index of every published declaration: one row per document, `;`-separated. */
export const hatvpListSource: OpenDataSource = {
  id: HATVP_SOURCE_ID,
  url: `${HATVP_ORIGIN}/livraison/opendata/liste.csv`
}

/**
 * A HATVP path made fetchable, such as a person's page from the list's
 * `url_dossier`: names with accents (`echaniz-iñaki-…`) are refused unless
 * percent-encoded.
 */
export const hatvpUrlOf = (path: string): string =>
  `${HATVP_ORIGIN}${encodeURI(path)}`

/**
 * A declaration file the list names (`nom_fichier` for the PDF, `open_data`
 * for the XML). Its name carries the declaration's id, so its content never
 * changes.
 */
export const declarationFileUrl = (fileName: string): string =>
  hatvpUrlOf(`/livraison/dossiers/${fileName}`)
