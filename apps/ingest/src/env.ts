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

const readEnv = () => envSchema.parse(process.env)

/** Downloaded source files and their validators, kept between runs. */
export const CACHE_DIR = resolve(REPOSITORY_ROOT, '.cache/open-data')

/** Where the datasets are published, under the paths of `datasetPaths`. */
export const DATA_DIR = resolve(REPOSITORY_ROOT, '.data')

/** Whether this run rebuilds the datasets even when no source changed. */
export const isForcedRun = (): boolean =>
  readEnv().INGEST_FORCE === 'true' || process.argv.includes(FORCE_FLAG)

/** The file a GitHub Actions step writes its outputs to; `null` outside one. */
export const githubOutputFile = (): string | null =>
  readEnv().GITHUB_OUTPUT ?? null
