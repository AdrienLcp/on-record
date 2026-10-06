import {
  deputyAmendmentsSchema,
  legislativeFileTitlesSchema
} from '@on-record/protocol/assembly/amendment'
import type { DeputyId } from '@on-record/protocol/assembly/official-ids'
import { datasetPaths } from '@on-record/protocol/datasets'

import { createDatasetReader } from '@/infrastructure/api/datasets-api'

const readDeputyAmendments = createDatasetReader(deputyAmendmentsSchema)
const readLegislativeFileTitles = createDatasetReader(
  legislativeFileTitlesSchema
)

/** The amendments one deputy tabled, newest first, up to a megabyte. */
export const fetchDeputyAmendments = ({
  deputyId,
  signal
}: {
  deputyId: DeputyId
  signal: AbortSignal
}) =>
  readDeputyAmendments({
    path: datasetPaths.deputyAmendments(deputyId),
    signal
  })

/** The titles of the legislative files amendments cite. */
export const fetchLegislativeFileTitles = (signal: AbortSignal) =>
  readLegislativeFileTitles({
    path: datasetPaths.legislativeFileTitles,
    signal
  })
