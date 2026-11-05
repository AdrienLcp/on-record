import type { OpenDataSource } from '@/domain/open-data-source.ts'
import {
  validateTextFile,
  validateWorkbook
} from '@/infrastructure/raw-file-validators.ts'

const COG_URL = 'https://www.insee.fr/fr/statistiques/fichier/8740222'

/** La Poste's file is the one source not in UTF-8. */
export const POSTCODES_ENCODING = 'latin1'

/**
 * Ministère de l'Intérieur: every commune and canton with its constituency,
 * as redrawn in 2010 and updated for 2017 (boundaries unchanged since).
 */
export const communeTableSource: OpenDataSource = {
  id: 'interior-commune-constituencies',
  url: 'https://static.data.gouv.fr/resources/circonscriptions-legislatives-table-de-correspondance-des-communes-et-des-cantons-pour-les-elections-legislatives-de-2012-et-sa-mise-a-jour-pour-les-elections-legislatives-2017/20170411-141128/Table_de_correspondance_circo_legislatives2017-1.xlsx',
  validate: validateWorkbook
}

/** INSEE, Code officiel géographique 2026: communes and arrondissements at 1 January. */
export const communesSource: OpenDataSource = {
  id: 'insee-communes',
  url: `${COG_URL}/v_commune_2026.csv`,
  validate: validateTextFile('utf-8')
}

/** INSEE, Code officiel géographique 2026: communes of the overseas collectivities. */
export const overseasCommunesSource: OpenDataSource = {
  id: 'insee-overseas-communes',
  url: `${COG_URL}/v_commune_comer_2026.csv`,
  validate: validateTextFile('utf-8')
}

/** INSEE, Code officiel géographique 2026: mergers, restorations and code changes. */
export const communeMovesSource: OpenDataSource = {
  id: 'insee-commune-moves',
  url: `${COG_URL}/v_mvt_commune_2026.csv`,
  validate: validateTextFile('utf-8')
}

/** La Poste, Base officielle des codes postaux. */
export const postcodesSource: OpenDataSource = {
  id: 'laposte-postcodes',
  url: 'https://data.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/raw',
  validate: validateTextFile(POSTCODES_ENCODING)
}

/** Contours of the constituencies, 10 m precision, published on data.gouv.fr. */
export const contoursSource: OpenDataSource = {
  id: 'constituency-contours',
  url: 'https://static.data.gouv.fr/resources/contours-geographiques-des-circonscriptions-legislatives/20240613-191520/circonscriptions-legislatives-p10.geojson',
  validate: validateTextFile('utf-8')
}

export const constituencySources: readonly OpenDataSource[] = [
  communeTableSource,
  communesSource,
  overseasCommunesSource,
  communeMovesSource,
  postcodesSource,
  contoursSource
]
