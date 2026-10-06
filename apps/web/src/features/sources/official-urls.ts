import type { DeputyId } from '@on-record/protocol/assembly/official-ids'

const ASSEMBLY_ORIGIN = 'https://www.assemblee-nationale.fr'

/** The licence every page cites, as the open-data portal links it. */
export const OPEN_LICENCE_URL =
  'https://www.etalab.gouv.fr/licence-ouverte-open-licence/'

export const OPEN_DATA_URL = 'https://data.assemblee-nationale.fr/'

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
