import type { SenateLegislativeFile } from '@on-record/protocol/senate/senate-scrutin.ts'

import type {
  RawBillRow,
  RawChamberReadingRow,
  RawReadingRow,
  RawSittingRow
} from '@/domain/senate-votes/raw-senate-rows.ts'

/**
 * Finds the bill a scrutin's sitting belongs to: sitting → reading in the
 * Senate → reading → bill. `null` when a link is missing or the bill has no
 * page or short name.
 */
export const legislativeFileFinder = ({
  bills,
  chamberReadings,
  readings,
  sittings
}: {
  bills: readonly RawBillRow[]
  chamberReadings: readonly RawChamberReadingRow[]
  readings: readonly RawReadingRow[]
  sittings: readonly RawSittingRow[]
}): ((sittingCode: string | null) => SenateLegislativeFile | null) => {
  const chamberReadingBySitting = new Map(
    sittings.map((row) => [row.code, row.lecidt])
  )
  const readingByChamberReading = new Map(
    chamberReadings.map((row) => [row.lecassidt, row.lecidt])
  )
  const billByReading = new Map(readings.map((row) => [row.lecidt, row.loicod]))
  const billByCode = new Map(bills.map((row) => [row.loicod, row]))

  return (sittingCode) => {
    if (sittingCode === null) return null
    const chamberReading = chamberReadingBySitting.get(sittingCode) ?? null
    const reading =
      chamberReading === null
        ? null
        : (readingByChamberReading.get(chamberReading) ?? null)
    const billCode =
      reading === null ? null : (billByReading.get(reading) ?? null)
    const bill = billCode === null ? undefined : billByCode.get(billCode)
    if (!bill?.signet || !bill.loient) return null
    return { id: bill.signet, title: bill.loient }
  }
}
