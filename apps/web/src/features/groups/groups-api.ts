import { groupsSchema } from '@on-record/protocol/assembly/group'
import { groupRecordSchema } from '@on-record/protocol/assembly/group-record'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'
import { datasetPaths } from '@on-record/protocol/datasets'

import { createDatasetReader } from '@/infrastructure/api/datasets-api'

const readGroups = createDatasetReader(groupsSchema)
const readGroupRecord = createDatasetReader(groupRecordSchema)

/** Every political group of the legislature, dissolved ones included. */
export const fetchGroups = (signal: AbortSignal) =>
  readGroups({ path: datasetPaths.groups, signal })

/** How one group voted on every scrutin it took part in, newest first. */
export const fetchGroupRecord = ({
  groupId,
  signal
}: {
  groupId: OrganId
  signal: AbortSignal
}) => readGroupRecord({ path: datasetPaths.groupRecord(groupId), signal })
