import { Result } from '@adrienlcp/result'
import { z } from 'zod'

/**
 * The Base Adresse Nationale geocoder, served by the IGN Géoplateforme: the
 * former api-adresse.data.gouv.fr redirects here. Free, no key, 50 requests a
 * second per IP, data under Licence Ouverte.
 */
const GEOCODER_URL = 'https://data.geopf.fr/geocodage/search'

const SUGGESTION_COUNT = '6'

const geocoderResponseSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
      properties: z.object({ id: z.string(), label: z.string() })
    })
  )
})

/** An address the geocoder knows, and where it is. */
export type AddressMatch = {
  id: string
  label: string
  /** `[longitude, latitude]`, WGS 84. */
  point: [number, number]
}

/**
 * - `aborted` — a newer search superseded this one: never shown
 * - `network` — the geocoder could not be reached, or refused
 * - `invalid` — it answered something else than addresses
 */
export type AddressSearchError = 'aborted' | 'invalid' | 'network'

/** Addresses matching what was typed, inside one commune. */
export const searchAddresses = async ({
  communeCode,
  query,
  signal
}: {
  communeCode: string
  query: string
  signal: AbortSignal
}): Promise<Result<AddressMatch[], AddressSearchError>> => {
  const url = new URL(GEOCODER_URL)
  url.search = new URLSearchParams({
    autocomplete: '1',
    citycode: communeCode,
    limit: SUGGESTION_COUNT,
    q: query
  }).toString()

  try {
    const response = await fetch(url, { signal })

    if (!response.ok) {
      return Result.failure('network')
    }

    const parsed = geocoderResponseSchema.safeParse(await response.json())

    if (!parsed.success) {
      return Result.failure('invalid')
    }

    return Result.success(
      parsed.data.features.map(({ geometry, properties }) => ({
        id: properties.id,
        label: properties.label,
        point: geometry.coordinates
      }))
    )
  } catch {
    return Result.failure(signal.aborted ? 'aborted' : 'network')
  }
}
