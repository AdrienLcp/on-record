import { Result } from '@adrienlcp/result'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import { fetchGroups } from '@/features/groups/groups-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'

import { fetchDeputies } from './deputies-api'

export type Directory = {
  deputies: Deputy[]
  groups: Group[]
}

/** Who sits, and the groups they sit in: what the deputies list and a deputy's page share. */
export const fetchDirectory = async (
  signal: AbortSignal
): Promise<Result<Directory, DatasetError>> => {
  const [deputies, groups] = await Promise.all([
    fetchDeputies(signal),
    fetchGroups(signal)
  ])

  if (deputies.status === 'failure') {
    return deputies
  }

  if (groups.status === 'failure') {
    return groups
  }

  return Result.success({ deputies: deputies.data, groups: groups.data })
}
