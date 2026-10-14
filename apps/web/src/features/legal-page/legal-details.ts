import { GEOCODER_URL } from '@/infrastructure/base-adresse/base-adresse-client'

/**
 * Who publishes the site and how to reach them: a non-professional publisher
 * gives a name and a contact, never a postal address or a phone number.
 */
export const PUBLISHER = {
  contactHref: 'https://adrienlcp.com/fr/contact',
  name: 'Adrien Lacourpaille'
} as const

export const HOST = {
  addressLines: ['101 Townsend St', 'San Francisco, CA 94107', 'USA'],
  name: 'Cloudflare, Inc.'
} as const

/** Where the address search sends what is typed. */
export const GEOCODER_HOST = new URL(GEOCODER_URL).host

/** The measurement's own service, whose public dashboard shows every figure it keeps. */
export const MEASUREMENT_HREF = 'https://analytics.adrienlcp.com'

/** The longest the measurement's raw records are kept, the CNIL's ceiling. */
export const MEASUREMENT_RETENTION_MONTHS = 25

export const CNIL_COMPLAINT_HREF = 'https://www.cnil.fr/fr/plaintes'
