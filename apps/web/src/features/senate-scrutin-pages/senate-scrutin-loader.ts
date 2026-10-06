import { Result } from '@adrienlcp/result'

import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type {
  SenateGroupId,
  SenatorId
} from '@on-record/protocol/senate/senate-ids'
import type { SenateScrutinDetail } from '@on-record/protocol/senate/senate-scrutin'
import { parseSenateScrutinId } from '@on-record/protocol/senate/senate-scrutin-number'
import type { Senator } from '@on-record/protocol/senate/senator'

import { fetchSenateScrutin } from '@/features/senate-scrutins/senate-scrutins-api'
import { senateGroupsById } from '@/features/senators/senator'
import { fetchSenateDirectory } from '@/features/senators/senators-api'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useRouteData } from '@/infrastructure/router/navigation'

/** What turns a Senate scrutin's ids into names. */
export type SenateScrutinContext = {
  groupById: ReadonlyMap<SenateGroupId, SenateGroup>
  senatorsById: ReadonlyMap<SenatorId, Senator>
}

const fetchSenateScrutinContext = async (
  signal: AbortSignal
): Promise<Result<SenateScrutinContext, DatasetError>> => {
  const directory = await fetchSenateDirectory(signal)

  if (directory.status === 'failure') {
    return directory
  }

  return Result.success({
    groupById: senateGroupsById(directory.data.groups),
    senatorsById: new Map(
      directory.data.senators.map((senator) => [senator.id, senator])
    )
  })
}

/** A URL whose id is not one: no file to download for it. */
const missingScrutin = async (): Promise<
  Result<SenateScrutinDetail, DatasetError>
> => Result.failure('missing')

export const senateScrutinLoader = ({
  scrutinId,
  signal
}: {
  scrutinId: string
  signal: AbortSignal
}) => {
  const scrutin = parseSenateScrutinId(scrutinId)

  return {
    context: fetchSenateScrutinContext(signal),
    /** `null` when the URL names no Senate scrutin at all. */
    requested: scrutin,
    scrutin:
      scrutin === null
        ? missingScrutin()
        : fetchSenateScrutin({ scrutin, signal })
  }
}

export const useSenateScrutinData = () =>
  useRouteData<typeof senateScrutinLoader>()
