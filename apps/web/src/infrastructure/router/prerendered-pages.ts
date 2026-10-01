import type { ScrutinKind } from '@on-record/protocol/assembly/scrutin'

import { fetchDirectory } from '@/features/deputies/directory-api'
import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
import { pageModuleFor } from '@/infrastructure/router/routes'
import {
  deputyHead,
  FIXED_PAGE_HEADS,
  type FixedPage,
  groupHead,
  type PageHead,
  scrutinHead
} from '@/presentation/head/page-heads'

import {
  deputyPathFor,
  groupPathFor,
  paths,
  scrutinPathFor
} from './navigation'

/** One document the build writes. */
export type PrerenderedPage = {
  head: PageHead
  /** How Vite's build manifest keys the chunk this page renders. */
  module: string
  /** Where the document is served, from the site root: `/deputes/PA1234`. */
  path: string
}

const FIXED_PAGE_PATHS = {
  deputies: paths.deputies,
  findMyDeputy: paths.findMyDeputy,
  groups: paths.groups,
  home: paths.home,
  method: paths.method,
  scrutins: paths.scrutins
} satisfies Record<FixedPage, string>

const isFixedPage = (page: string): page is FixedPage =>
  page in FIXED_PAGE_PATHS

/**
 * Searched for and shared: the rest of the 8,000 scrutins, mostly amendments,
 * stay client-rendered through the SPA fallback, which keeps the deployment
 * far from the host's file limit.
 */
const PRERENDERED_SCRUTIN_KINDS: ReadonlySet<ScrutinKind> = new Set([
  'censure',
  'solemn'
])

/**
 * Read off the datasets, so a deputy who takes a seat or a new solemn vote
 * gets its own document on the next nightly build.
 */
export const listPrerenderedPages = async (
  signal: AbortSignal
): Promise<PrerenderedPage[]> => {
  const [directory, scrutins] = await Promise.all([
    fetchDirectory(signal),
    fetchScrutinIndex(signal)
  ])

  if (directory.status === 'failure') {
    throw new Error(`The deputies could not be read: ${directory.error}`)
  }

  if (scrutins.status === 'failure') {
    throw new Error(`The scrutin index could not be read: ${scrutins.error}`)
  }

  const { deputies, groups } = directory.data

  return [
    ...Object.keys(FIXED_PAGE_PATHS)
      .filter(isFixedPage)
      .map(
        (page): PrerenderedPage => ({
          head: FIXED_PAGE_HEADS[page],
          module: pageModuleFor(FIXED_PAGE_PATHS[page]),
          path: FIXED_PAGE_PATHS[page]
        })
      ),
    ...deputies.map(
      (deputy): PrerenderedPage => ({
        head: deputyHead({ deputy, groups }),
        module: pageModuleFor(paths.deputy),
        path: deputyPathFor(deputy.id)
      })
    ),
    ...groups.map(
      (group): PrerenderedPage => ({
        head: groupHead(group),
        module: pageModuleFor(paths.group),
        path: groupPathFor(group.id)
      })
    ),
    ...scrutins.data
      .filter(({ kind }) => PRERENDERED_SCRUTIN_KINDS.has(kind))
      .map(
        (scrutin): PrerenderedPage => ({
          head: scrutinHead(scrutin),
          module: pageModuleFor(paths.scrutin),
          path: scrutinPathFor(scrutin.number)
        })
      )
  ]
}
