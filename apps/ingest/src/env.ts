import { resolve } from 'node:path'

import { z } from 'zod'

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../..')
const FORCE_FLAG = '--force'

const envSchema = z.object({
  /** Set by GitHub Actions: the file a step writes its outputs to. */
  GITHUB_OUTPUT: z.string().min(1).optional(),
  /** `true` rebuilds the datasets even when no source changed, like `--force`. */
  INGEST_FORCE: z.enum(['false', 'true']).default('false')
})

const parsed = envSchema.parse(process.env)

/** The environment of an ingest run, read once. */
export const env = {
  /** Downloaded zips and their validators, kept between runs. */
  cacheDir: resolve(REPOSITORY_ROOT, '.cache/assembly'),
  /** Where the datasets are published, under the paths of `datasetPaths`. */
  dataDir: resolve(REPOSITORY_ROOT, '.data'),
  force: parsed.INGEST_FORCE === 'true' || process.argv.includes(FORCE_FLAG),
  githubOutputFile: parsed.GITHUB_OUTPUT ?? null
} as const
