import type { OpenDataSource } from '@/domain/open-data-source.ts'

/** The legislature this ingest covers: the 17th, elected in July 2024. */
export const LEGISLATURE = 17

/** How the open data writes the legislature in every file. */
export const LEGISLATURE_CODE = String(LEGISLATURE)

const REPOSITORY_URL = `https://data.assemblee-nationale.fr/static/openData/repository/${LEGISLATURE}`

export const scrutinsSource: OpenDataSource = {
  id: 'assembly-scrutins',
  url: `${REPOSITORY_URL}/loi/scrutins/Scrutins.json.zip`
}

/** AMO10: the deputies sitting today, their mandates and the organs. */
export const currentDeputiesSource: OpenDataSource = {
  id: 'assembly-current-deputies',
  url: `${REPOSITORY_URL}/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`
}

/** AMO30: every actor and organ on record, deputies who left included. */
export const deputiesHistorySource: OpenDataSource = {
  id: 'assembly-deputies-history',
  url: `${REPOSITORY_URL}/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`
}

export const assemblySources: readonly OpenDataSource[] = [
  scrutinsSource,
  currentDeputiesSource,
  deputiesHistorySource
]
