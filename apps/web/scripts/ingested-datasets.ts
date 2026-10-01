import { existsSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

/** Where `apps/ingest` writes the datasets, git-ignored. */
export const INGESTED_DATASETS_DIR = resolve(
  import.meta.dirname,
  '../../../.data'
)

const isInside = ({ child, parent }: { child: string; parent: string }) => {
  const path = relative(parent, child)

  return path !== '' && !path.startsWith('..') && !isAbsolute(path)
}

/**
 * The ingested file a request below `DATASETS_BASE_PATH` names, or `null` when
 * there is none, or when the path climbs out of the datasets folder.
 */
export const ingestedDatasetFileFor = (
  pathBelowDatasetsBase: string
): string | null => {
  const pathname = decodeURIComponent(
    new URL(pathBelowDatasetsBase, 'http://datasets').pathname
  )
  const file = join(INGESTED_DATASETS_DIR, pathname)

  return isInside({ child: file, parent: INGESTED_DATASETS_DIR }) &&
    existsSync(file) &&
    statSync(file).isFile()
    ? file
    : null
}
