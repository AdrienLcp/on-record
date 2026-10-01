import { OPEN_LICENCE_URL } from './official-urls'

/** A licence a source is published under, as the sources page cites it. */
export type SourceLicence = {
  name: 'licenceOuverte'
  url: string
}

const LICENCE_OUVERTE: SourceLicence = {
  name: 'licenceOuverte',
  url: OPEN_LICENCE_URL
}

/**
 * What the sources page says about each file ingest reads, keyed by the id
 * ingest writes into `meta.json`. A source missing here still shows its file
 * and date, under its file name and without a licence line.
 */
const SOURCE_LICENCES = {
  'assembly-current-deputies': LICENCE_OUVERTE,
  'assembly-deputies-history': LICENCE_OUVERTE,
  'assembly-scrutins': LICENCE_OUVERTE,
  'constituency-contours': LICENCE_OUVERTE,
  'insee-commune-moves': LICENCE_OUVERTE,
  'insee-communes': LICENCE_OUVERTE,
  'insee-overseas-communes': LICENCE_OUVERTE,
  'interior-commune-constituencies': LICENCE_OUVERTE,
  'laposte-postcodes': LICENCE_OUVERTE
} as const satisfies Record<string, SourceLicence>

export type CataloguedSourceId = keyof typeof SOURCE_LICENCES

export const isCataloguedSource = (id: string): id is CataloguedSourceId =>
  id in SOURCE_LICENCES

export const licenceOf = (id: CataloguedSourceId): SourceLicence =>
  SOURCE_LICENCES[id]
