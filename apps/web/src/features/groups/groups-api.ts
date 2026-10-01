import { groupsSchema } from '@on-record/protocol/assembly/group'
import { datasetPaths } from '@on-record/protocol/datasets'

import { createDatasetReader } from '@/infrastructure/api/datasets-api'

const readGroups = createDatasetReader(groupsSchema)

/** Every political group of the legislature, dissolved ones included. */
export const fetchGroups = (signal: AbortSignal) =>
  readGroups({ path: datasetPaths.groups, signal })
