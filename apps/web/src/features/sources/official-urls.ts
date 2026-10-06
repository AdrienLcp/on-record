import type { DeputyId } from '@on-record/protocol/assembly/official-ids'
import type { SenateScrutinNumber } from '@on-record/protocol/senate/senate-scrutin-number'
import type { Senator } from '@on-record/protocol/senate/senator'

const ASSEMBLY_ORIGIN = 'https://www.assemblee-nationale.fr'

const SENATE_ORIGIN = 'https://www.senat.fr'

/** The licence every page cites, as the open-data portal links it. */
export const OPEN_LICENCE_URL =
  'https://www.etalab.gouv.fr/licence-ouverte-open-licence/'

export const OPEN_DATA_URL = 'https://data.assemblee-nationale.fr/'

export const SENATE_OPEN_DATA_URL = 'https://data.senat.fr/'

export const HATVP_OPEN_DATA_URL = 'https://www.hatvp.fr/open-data/'

export const officialScrutinUrl = ({
  legislature,
  scrutinNumber
}: {
  legislature: number
  scrutinNumber: number
}): string => `${ASSEMBLY_ORIGIN}/dyn/${legislature}/scrutins/${scrutinNumber}`

export const officialLegislativeFileUrl = ({
  legislature,
  legislativeFileId
}: {
  legislature: number
  legislativeFileId: string
}): string =>
  `${ASSEMBLY_ORIGIN}/dyn/${legislature}/dossiers/${legislativeFileId}`

export const officialDeputyUrl = (deputyId: DeputyId): string =>
  `${ASSEMBLY_ORIGIN}/dyn/deputes/${deputyId}`

/** `officialPath` as ingest builds it: `1906A/AN/2194`, `0324C/CION_FIN/CF12`. */
export const officialAmendmentUrl = ({
  legislature,
  officialPath
}: {
  legislature: number
  officialPath: string
}): string =>
  `${ASSEMBLY_ORIGIN}/dyn/${legislature}/amendements/${officialPath}`

export const officialSenateScrutinUrl = ({
  number,
  session
}: SenateScrutinNumber): string =>
  `${SENATE_ORIGIN}/scrutin-public/${session}/scr${session}-${number}.html`

/** `id` as ingest reads it from the Senate: `pjl25-689`, `plfss2026`. */
export const officialSenateLegislativeFileUrl = (id: string): string =>
  `${SENATE_ORIGIN}/dossier-legislatif/${id}.html`

/** Names folded the way senat.fr spells its pages: `delcros_bernard14034l`. */
const senateSlugOf = (words: string): string =>
  words
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')

export const officialSenatorUrl = (
  senator: Pick<Senator, 'firstName' | 'id' | 'lastName'>
): string =>
  `${SENATE_ORIGIN}/senateur/${senateSlugOf(`${senator.lastName}_${senator.firstName}`)}${senator.id.toLowerCase()}.html`
