import { datasetPaths, datasetsMetaSchema } from '@on-record/protocol/datasets'

import { createDatasetReader } from '@/infrastructure/api/datasets-api'

const readMeta = createDatasetReader(datasetsMetaSchema)

/** When the datasets were built and from which official files. */
export const fetchDatasetsMeta = (signal: AbortSignal) =>
  readMeta({ path: datasetPaths.meta, signal })
