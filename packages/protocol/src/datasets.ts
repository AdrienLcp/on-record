import { z } from 'zod'

import type { DepartmentCode, DeputyId, OrganId } from './assembly/official-ids'

/** Where the site serves the datasets from, relative to its origin. */
export const DATASETS_BASE_PATH = '/data'

/** Each dataset's path below `DATASETS_BASE_PATH`: ingest writes them, web reads them. */
export const datasetPaths = {
  communes: 'assembly/communes.json',
  constituencyContours: (department: DepartmentCode): string =>
    `assembly/constituency-contours/${department}.json`,
  deputies: 'assembly/deputies.json',
  deputyRecord: (deputyId: DeputyId): string =>
    `assembly/deputies/${deputyId}.json`,
  groupRecord: (groupId: OrganId): string => `assembly/groups/${groupId}.json`,
  groups: 'assembly/groups.json',
  highlights: 'assembly/highlights.json',
  meta: 'meta.json',
  scrutinBlock: (block: number): string => `assembly/scrutins/${block}.json`,
  scrutinIndex: 'assembly/scrutins.json'
} as const

export const sourceSchema = z.object({
  id: z.string().min(1),
  /** The source's own `Last-Modified`, when it sends one. */
  lastModified: z.string().nullable(),
  url: z.url()
})

/** What the build knows about its own freshness, shown on the sources page. */
export const datasetsMetaSchema = z.object({
  generatedAt: z.iso.datetime(),
  legislature: z.number().int().positive(),
  sources: z.array(sourceSchema)
})

export type DatasetsMeta = z.infer<typeof datasetsMetaSchema>
export type Source = z.infer<typeof sourceSchema>
