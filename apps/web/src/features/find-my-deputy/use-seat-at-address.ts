import { useEffect, useState } from 'react'

import type { Commune } from '@/features/communes/commune'
import { fetchConstituencyContours } from '@/features/communes/communes-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import type { AddressMatch } from '@/infrastructure/base-adresse/base-adresse-client'

import { constituencyAtPoint } from './constituency-at-point'
import type { Seat } from './seat-holder'

/**
 * - `none` — no address chosen yet
 * - `locating` — reading the contours of the commune's constituencies
 * - `located` — the address lies in this constituency
 * - `unplaced` — the point fell outside the commune's constituencies, as a
 *   geocoder or a simplified boundary sometimes puts it
 * - `failed` — the contours could not be read
 */
export type SeatAtAddress =
  | { status: 'none' }
  | { status: 'locating' }
  | { seat: Seat; status: 'located' }
  | { status: 'unplaced' }
  | { error: Exclude<DatasetError, 'aborted'>; status: 'failed' }

/** The constituency an address of a split commune lies in. */
export const useSeatAtAddress = ({
  address,
  commune
}: {
  address: AddressMatch | null
  commune: Commune
}): SeatAtAddress => {
  const [seatAtAddress, setSeatAtAddress] = useState<SeatAtAddress>({
    status: 'none'
  })

  useEffect(() => {
    if (address === null) {
      setSeatAtAddress({ status: 'none' })
      return
    }

    const controller = new AbortController()
    setSeatAtAddress({ status: 'locating' })

    void fetchConstituencyContours({
      department: commune.department,
      signal: controller.signal
    }).then((contours) => {
      if (contours.status === 'failure') {
        if (contours.error !== 'aborted') {
          setSeatAtAddress({ error: contours.error, status: 'failed' })
        }
        return
      }

      const constituency = constituencyAtPoint({
        contours: contours.data.constituencies.filter(({ constituency }) =>
          commune.constituencies.includes(constituency)
        ),
        point: address.point
      })

      setSeatAtAddress(
        constituency === null
          ? { status: 'unplaced' }
          : {
              seat: { constituency, department: commune.department },
              status: 'located'
            }
      )
    })

    return () => controller.abort()
  }, [address, commune])

  return seatAtAddress
}
