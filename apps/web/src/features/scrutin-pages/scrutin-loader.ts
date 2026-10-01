import { Result } from '@adrienlcp/result'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids'
import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fetchDirectory } from '@/features/deputies/directory-api'
import { groupsById } from '@/features/groups/group-members'
import {
  fetchScrutin,
  parseScrutinNumber
} from '@/features/scrutins/scrutins-api'
import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

/** What turns a scrutin's ids into names, and its number into an official link. */
export type ScrutinContext = {
  deputiesById: ReadonlyMap<DeputyId, Deputy>
  groupById: ReadonlyMap<OrganId, Group>
  legislature: number
}

const fetchScrutinContext = async (
  signal: AbortSignal
): Promise<Result<ScrutinContext, DatasetError>> => {
  const [directory, meta] = await Promise.all([
    fetchDirectory(signal),
    fetchDatasetsMeta(signal)
  ])

  if (directory.status === 'failure') {
    return directory
  }

  if (meta.status === 'failure') {
    return meta
  }

  return Result.success({
    deputiesById: new Map(
      directory.data.deputies.map((deputy) => [deputy.id, deputy])
    ),
    groupById: groupsById(directory.data.groups),
    legislature: meta.data.legislature
  })
}

/** A URL whose number is not one: no file to download for it. */
const missingScrutin = async (): Promise<Result<ScrutinDetail, DatasetError>> =>
  Result.failure('missing')

export const scrutinLoader = ({
  scrutinNumber,
  signal
}: {
  scrutinNumber: string
  signal: AbortSignal
}) => {
  const number = parseScrutinNumber(scrutinNumber)

  return {
    context: fetchScrutinContext(signal),
    scrutin:
      number === null
        ? missingScrutin()
        : fetchScrutin({ scrutinNumber: number, signal })
  }
}

export const useScrutinData = () => useRouteData<typeof scrutinLoader>()
