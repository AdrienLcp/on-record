import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import { parseCsv, recordsOf } from '@/domain/constituencies/csv-rows.ts'
import {
  type RawHatvpListRow,
  rawHatvpListRowSchema
} from '@/domain/hatvp/raw-hatvp-list.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import { checkRaw } from '@/domain/raw-parsing.ts'

export type HatvpChamber = 'assembly' | 'senate'

/** How the list's `type_mandat` names each chamber's mandate. */
const MANDATE_TYPES = {
  assembly: 'depute',
  senate: 'senateur'
} as const satisfies Record<HatvpChamber, string>

/** One parliamentarian of the list, with the documents of their seat in one chamber. */
export type HatvpPerson = {
  chamber: HatvpChamber
  firstName: string
  lastName: string
  /** The person's id in the chamber's data, when the HATVP filled it in. */
  originId: string | null
  /** `/pages_nominatives/…`, the same on every row of the person. */
  pagePath: string
  rows: RawHatvpListRow[]
}

const chamberOf = (mandateType: string | undefined): HatvpChamber | null => {
  if (mandateType === MANDATE_TYPES.assembly) return 'assembly'
  if (mandateType === MANDATE_TYPES.senate) return 'senate'
  return null
}

/**
 * The parliamentarians of `liste.csv`, one per chamber they sit in, each with
 * the rows of that seat. Rows about other mandates (mayor, MEP…) are left out.
 */
export const readHatvpList = (
  text: string,
  path: string
): Result<HatvpPerson[], IngestError> => {
  const records = recordsOf(parseCsv(text, ';')).filter(
    (record) => chamberOf(record.type_mandat) !== null
  )
  const rows = checkRaw(records, z.array(rawHatvpListRowSchema), path)
  if (rows.status === 'failure') return rows

  const people = new Map<string, HatvpPerson>()
  for (const row of rows.data) {
    const chamber = chamberOf(row.type_mandat)
    if (chamber === null) continue
    const key = `${chamber} ${row.url_dossier}`
    const person = people.get(key)
    if (person === undefined) {
      people.set(key, {
        chamber,
        firstName: row.prenom,
        lastName: row.nom,
        originId: row.id_origine,
        pagePath: row.url_dossier,
        rows: [row]
      })
    } else {
      person.rows.push(row)
      person.originId ??= row.id_origine
    }
  }
  return Result.success([...people.values()])
}
