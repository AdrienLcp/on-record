import { Result } from '@adrienlcp/result'

import { communeIndexSchema } from '@on-record/protocol/assembly/commune'
import { constituencyContoursSchema } from '@on-record/protocol/assembly/constituency-contour'
import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids'
import { datasetPaths } from '@on-record/protocol/datasets'

import {
  createDatasetReader,
  type DatasetError
} from '@/infrastructure/api/datasets-api'

import { type Commune, toCommune } from './commune'

const readCommuneIndex = createDatasetReader(communeIndexSchema)
const readConstituencyContours = createDatasetReader(constituencyContoursSchema)

let communes: Commune[] | null = null

/**
 * Every current commune, about 35,000: 380 KB over the wire, so a page reads
 * it once someone starts to search, not on arrival.
 */
export const fetchCommunes = async (
  signal: AbortSignal
): Promise<Result<Commune[], DatasetError>> => {
  if (communes !== null) {
    return Result.success(communes)
  }

  const index = await readCommuneIndex({ path: datasetPaths.communes, signal })

  if (index.status === 'failure') {
    return index
  }

  communes = index.data.map(toCommune)

  return Result.success(communes)
}

/** The contours of a department's constituencies that cut through a commune. */
export const fetchConstituencyContours = ({
  department,
  signal
}: {
  department: DepartmentCode
  signal: AbortSignal
}) =>
  readConstituencyContours({
    path: datasetPaths.constituencyContours(department),
    signal
  })
