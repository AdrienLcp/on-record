import type {
  LoaderFunction,
  RouteObject,
  ShouldRevalidateFunction
} from 'react-router'

import { compareLoader } from '@/features/compare-page/compare-loader'
import { deputiesLoader } from '@/features/deputy-pages/deputies-loader'
import { deputyLoader } from '@/features/deputy-pages/deputy-loader'
import { findMyDeputyLoader } from '@/features/find-my-deputy/find-my-deputy-loader'
import { groupLoader } from '@/features/group-pages/group-loader'
import { groupsLoader } from '@/features/group-pages/groups-loader'
import { methodLoader } from '@/features/method-page/method-loader'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import { scrutinLoader } from '@/features/scrutin-pages/scrutin-loader'
import { scrutinsLoader } from '@/features/scrutin-pages/scrutins-loader'
import { senateScrutinLoader } from '@/features/senate-scrutin-pages/senate-scrutin-loader'
import { senateScrutinsLoader } from '@/features/senate-scrutin-pages/senate-scrutins-loader'
import { senatorLoader } from '@/features/senator-pages/senator-loader'
import { senatorsLoader } from '@/features/senator-pages/senators-loader'
import { voteMatchLoader } from '@/features/vote-match-page/vote-match-loader'
import { paths, type RoutedPath } from '@/infrastructure/router/navigation'
import { RootRoute, rootLoader } from '@/infrastructure/router/root-route'
import { ErrorScreen } from '@/presentation/error-screen'
import { RouteFallback } from '@/presentation/route-fallback'

/** Keyed by path, so a path with no page fails to compile. */
const pageFor = {
  [paths.compare]: async () => ({
    Component: (await import('@/features/compare-page/compare-page'))
      .ComparePage
  }),
  [paths.deputies]: async () => ({
    Component: (await import('@/features/deputy-pages/deputies-page'))
      .DeputiesPage
  }),
  [paths.deputy]: async () => ({
    Component: (await import('@/features/deputy-pages/deputy-page')).DeputyPage
  }),
  [paths.findMyDeputy]: async () => ({
    Component: (await import('@/features/find-my-deputy/find-my-deputy-page'))
      .FindMyDeputyPage
  }),
  [paths.group]: async () => ({
    Component: (await import('@/features/group-pages/group-page')).GroupPage
  }),
  [paths.groups]: async () => ({
    Component: (await import('@/features/group-pages/groups-page')).GroupsPage
  }),
  [paths.method]: async () => ({
    Component: (await import('@/features/method-page/method-page')).MethodPage
  }),
  [paths.scrutin]: async () => ({
    Component: (await import('@/features/scrutin-pages/scrutin-page'))
      .ScrutinPage
  }),
  [paths.scrutins]: async () => ({
    Component: (await import('@/features/scrutin-pages/scrutins-page'))
      .ScrutinsPage
  }),
  [paths.senateScrutin]: async () => ({
    Component: (
      await import('@/features/senate-scrutin-pages/senate-scrutin-page')
    ).SenateScrutinPage
  }),
  [paths.senateScrutins]: async () => ({
    Component: (
      await import('@/features/senate-scrutin-pages/senate-scrutins-page')
    ).SenateScrutinsPage
  }),
  [paths.senator]: async () => ({
    Component: (await import('@/features/senator-pages/senator-page'))
      .SenatorPage
  }),
  [paths.senators]: async () => ({
    Component: (await import('@/features/senator-pages/senators-page'))
      .SenatorsPage
  }),
  [paths.voteMatch]: async () => ({
    Component: (await import('@/features/vote-match-page/vote-match-page'))
      .VoteMatchPage
  })
} satisfies Record<RoutedPath, RouteObject['lazy']>

/**
 * Each page's source module, as Vite's build manifest keys its chunk: the
 * prerender inlines that chunk's styles and preloads it.
 */
const pageModules = {
  [paths.compare]: 'src/features/compare-page/compare-page.tsx',
  [paths.deputies]: 'src/features/deputy-pages/deputies-page.tsx',
  [paths.deputy]: 'src/features/deputy-pages/deputy-page.tsx',
  [paths.findMyDeputy]: 'src/features/find-my-deputy/find-my-deputy-page.tsx',
  [paths.group]: 'src/features/group-pages/group-page.tsx',
  [paths.groups]: 'src/features/group-pages/groups-page.tsx',
  [paths.method]: 'src/features/method-page/method-page.tsx',
  [paths.scrutin]: 'src/features/scrutin-pages/scrutin-page.tsx',
  [paths.scrutins]: 'src/features/scrutin-pages/scrutins-page.tsx',
  [paths.senateScrutin]:
    'src/features/senate-scrutin-pages/senate-scrutin-page.tsx',
  [paths.senateScrutins]:
    'src/features/senate-scrutin-pages/senate-scrutins-page.tsx',
  [paths.senator]: 'src/features/senator-pages/senator-page.tsx',
  [paths.senators]: 'src/features/senator-pages/senators-page.tsx',
  [paths.voteMatch]: 'src/features/vote-match-page/vote-match-page.tsx'
} satisfies Record<RoutedPath, string>

export const pageModuleFor = (path: RoutedPath): string => pageModules[path]

/**
 * Outside `lazy`, so the data starts downloading beside the page's chunk. The
 * only place that reads URL params: each loader gets plain values, so a
 * prerender can call it with a deputy id. Promises go back unawaited.
 */
const loaderFor = {
  [paths.compare]: ({ request }) => compareLoader({ signal: request.signal }),
  [paths.deputies]: ({ request }) => deputiesLoader({ signal: request.signal }),
  [paths.deputy]: ({ params, request }) =>
    deputyLoader({ deputyId: params.deputyId ?? '', signal: request.signal }),
  [paths.findMyDeputy]: ({ request }) =>
    findMyDeputyLoader({ signal: request.signal }),
  [paths.group]: ({ params, request }) =>
    groupLoader({ groupId: params.groupId ?? '', signal: request.signal }),
  [paths.groups]: ({ request }) => groupsLoader({ signal: request.signal }),
  [paths.method]: ({ request }) => methodLoader({ signal: request.signal }),
  [paths.scrutin]: ({ params, request }) =>
    scrutinLoader({
      scrutinNumber: params.scrutinNumber ?? '',
      signal: request.signal
    }),
  [paths.scrutins]: ({ request }) => scrutinsLoader({ signal: request.signal }),
  [paths.senateScrutin]: ({ params, request }) =>
    senateScrutinLoader({
      scrutinId: params.scrutinId ?? '',
      signal: request.signal
    }),
  [paths.senateScrutins]: ({ request }) =>
    senateScrutinsLoader({ signal: request.signal }),
  [paths.senator]: ({ params, request }) =>
    senatorLoader({
      senatorId: params.senatorId ?? '',
      signal: request.signal
    }),
  [paths.senators]: ({ request }) => senatorsLoader({ signal: request.signal }),
  [paths.voteMatch]: ({ request }) =>
    voteMatchLoader({ signal: request.signal })
} satisfies Record<RoutedPath, LoaderFunction>

/**
 * A list's filters live in the query string: changing one must not reload the
 * page's data, which would suspend the list on every keystroke.
 */
const onlyWhenThePathChanges: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl
}) => currentUrl.pathname !== nextUrl.pathname

const routeFor = (path: RoutedPath): RouteObject => ({
  lazy: pageFor[path],
  loader: loaderFor[path],
  path,
  shouldRevalidate: onlyWhenThePathChanges
})

/** The tree, not a router: a prerender can mount the same one. */
export const routes: RouteObject[] = [
  {
    Component: RootRoute,
    children: [
      ...Object.values(paths).map(routeFor),
      { Component: NotFoundPage, path: '*' }
    ],
    ErrorBoundary: ErrorScreen,
    HydrateFallback: RouteFallback,
    loader: ({ request }) => rootLoader({ signal: request.signal }),
    shouldRevalidate: () => false
  }
]
