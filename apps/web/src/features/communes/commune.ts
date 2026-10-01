import type {
  CommuneCode,
  CommuneEntry
} from '@on-record/protocol/assembly/commune'
import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids'

import { searchableText } from '@/helpers/search-text'

/** A commune of today's map and the constituencies it votes in. */
export type Commune = {
  code: CommuneCode
  /** Numbers within `department`; several when the commune is split. */
  constituencies: readonly number[]
  department: DepartmentCode
  name: string
  postcodes: readonly string[]
  /** The name as the search compares it, computed once. */
  searchName: string
}

export const toCommune = ([
  code,
  name,
  postcodes,
  department,
  constituencies
]: CommuneEntry): Commune => ({
  code,
  constituencies,
  department,
  name,
  postcodes,
  searchName: searchableText(name)
})

/** Split between constituencies: only an address tells which one applies. */
export const isSplitCommune = (commune: Commune): boolean =>
  commune.constituencies.length > 1
