import { Result } from '@adrienlcp/result'

import { datasetPaths } from '@on-record/protocol/datasets'
import {
  type SenateGroup,
  senateGroupsSchema
} from '@on-record/protocol/senate/senate-group'
import type { SenatorId } from '@on-record/protocol/senate/senate-ids'
import {
  type Senator,
  senatorsSchema
} from '@on-record/protocol/senate/senator'
import { senatorRecordSchema } from '@on-record/protocol/senate/senator-record'

import {
  createDatasetReader,
  type DatasetError
} from '@/infrastructure/api/datasets-api'

const readSenators = createDatasetReader(senatorsSchema)
const readSenateGroups = createDatasetReader(senateGroupsSchema)
const readSenatorRecord = createDatasetReader(senatorRecordSchema)

/** Everyone who held a seat since the covered scrutins began. */
export const fetchSenators = (signal: AbortSignal) =>
  readSenators({ path: datasetPaths.senators, signal })

/** Every political group of the Senate in that time, under its latest name. */
export const fetchSenateGroups = (signal: AbortSignal) =>
  readSenateGroups({ path: datasetPaths.senateGroups, signal })

/** One senator's ballots, newest scrutin first. */
export const fetchSenatorRecord = ({
  senatorId,
  signal
}: {
  senatorId: SenatorId
  signal: AbortSignal
}) => readSenatorRecord({ path: datasetPaths.senatorRecord(senatorId), signal })

export type SenateDirectory = {
  groups: SenateGroup[]
  senators: Senator[]
}

/** Who sits, and the groups they sit in: what the senators list and a senator's page share. */
export const fetchSenateDirectory = async (
  signal: AbortSignal
): Promise<Result<SenateDirectory, DatasetError>> => {
  const [senators, groups] = await Promise.all([
    fetchSenators(signal),
    fetchSenateGroups(signal)
  ])

  if (senators.status === 'failure') {
    return senators
  }

  if (groups.status === 'failure') {
    return groups
  }

  return Result.success({ groups: groups.data, senators: senators.data })
}
