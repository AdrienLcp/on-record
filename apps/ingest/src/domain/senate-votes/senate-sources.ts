import type { OpenDataSource } from '@/domain/open-data-source.ts'
import type {
  DumpRow,
  TableSelection
} from '@/infrastructure/pg-dump-reader.ts'
import { validateSqlDump } from '@/infrastructure/raw-file-validators.ts'

const SENATE_OPEN_DATA_URL = 'https://data.senat.fr/data'

/**
 * The first session covered: it opened on 2023-10-02, after the 2023
 * renewal. Before it, ballots do not list every senator.
 */
export const FIRST_SENATE_SESSION = 2023

const isCoveredSession = (row: DumpRow): boolean =>
  Number(row.sesann) >= FIRST_SENATE_SESSION

/** The tables read from the legislative dump; scrutins and ballots of the covered sessions only. */
export const doslegTables: TableSelection = {
  corscr: isCoveredSession,
  date_seance: null,
  lecass: null,
  lecture: null,
  loi: null,
  scr: isCoveredSession,
  votsen: isCoveredSession
}

/** The tables read from the senators dump, whole. */
export const senatorsTables: TableSelection = {
  dpt: null,
  elusen: null,
  grppol: null,
  memgrppol: null,
  sen: null
}

/** The legislative database dump: scrutins, ballots, corrections, bills. */
export const doslegSource: OpenDataSource = {
  id: 'senate-dosleg',
  url: `${SENATE_OPEN_DATA_URL}/dosleg/dosleg.zip`,
  validate: validateSqlDump(Object.keys(doslegTables))
}

/** The senators dump: people, seats, group memberships, departments. */
export const senatorsSource: OpenDataSource = {
  id: 'senate-senators',
  url: `${SENATE_OPEN_DATA_URL}/senateurs/export_sens.zip`,
  validate: validateSqlDump(Object.keys(senatorsTables))
}

export const senateSources: readonly OpenDataSource[] = [
  doslegSource,
  senatorsSource
]
