import type { OpenDataSource } from '@/domain/open-data-source.ts'

const SENATE_OPEN_DATA_URL = 'https://data.senat.fr/data'

/** The legislative database dump: scrutins, ballots, corrections, bills. */
export const doslegSource: OpenDataSource = {
  id: 'senate-dosleg',
  url: `${SENATE_OPEN_DATA_URL}/dosleg/dosleg.zip`
}

/** The senators dump: people, seats, group memberships, departments. */
export const senatorsSource: OpenDataSource = {
  id: 'senate-senators',
  url: `${SENATE_OPEN_DATA_URL}/senateurs/export_sens.zip`
}

export const senateSources: readonly OpenDataSource[] = [
  doslegSource,
  senatorsSource
]

/**
 * The first session covered: it opened on 2023-10-02, after the 2023
 * renewal. Before it, ballots do not list every senator.
 */
export const FIRST_SENATE_SESSION = 2023
