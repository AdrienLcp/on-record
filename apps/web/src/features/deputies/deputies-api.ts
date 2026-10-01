import { deputiesSchema } from '@on-record/protocol/assembly/deputy'
import { deputyRecordSchema } from '@on-record/protocol/assembly/deputy-record'
import type { DeputyId } from '@on-record/protocol/assembly/official-ids'
import { datasetPaths } from '@on-record/protocol/datasets'

import { createDatasetReader } from '@/infrastructure/api/datasets-api'

const readDeputies = createDatasetReader(deputiesSchema)
const readDeputyRecord = createDatasetReader(deputyRecordSchema)

/** Everyone who held a seat during the legislature. */
export const fetchDeputies = (signal: AbortSignal) =>
  readDeputies({ path: datasetPaths.deputies, signal })

/** One deputy's ballots, newest scrutin first. */
export const fetchDeputyRecord = ({
  deputyId,
  signal
}: {
  deputyId: DeputyId
  signal: AbortSignal
}) => readDeputyRecord({ path: datasetPaths.deputyRecord(deputyId), signal })
