import type { RouteObject, ShouldRevalidateFunction } from 'react-router'

import { NotFoundPage } from '@/features/not-found/not-found-page'
import { paths, type RoutedPath } from '@/infrastructure/router/navigation'
import { RootRoute, rootLoader } from '@/infrastructure/router/root-route'
import { ErrorScreen } from '@/presentation/error-screen'
import { RouteFallback } from '@/presentation/route-fallback'

/**
 * Keyed by path, so a path with no page fails to compile. The loader is lazy
 * too, in a definition of its own: React Router fetches its chunk beside the
 * page's, and a static import here would modulepreload the feature from the
 * shell on every page. The only place that reads URL params: each loader gets
 * plain values, so a prerender can call it with a deputy id. Promises go back
 * unawaited.
 */
const lazyRouteFor = {
  [paths.compare]: {
    Component: async () =>
      (await import('@/features/compare-page/compare-page')).ComparePage,
    loader: async () => {
      const { compareLoader } = await import(
        '@/features/compare-page/compare-loader'
      )

      return ({ request }) => compareLoader({ signal: request.signal })
    }
  },
  [paths.deputies]: {
    Component: async () =>
      (await import('@/features/deputy-pages/deputies-page')).DeputiesPage,
    loader: async () => {
      const { deputiesLoader } = await import(
        '@/features/deputy-pages/deputies-loader'
      )

      return ({ request }) => deputiesLoader({ signal: request.signal })
    }
  },
  [paths.deputy]: {
    Component: async () =>
      (await import('@/features/deputy-pages/deputy-page')).DeputyPage,
    loader: async () => {
      const { deputyLoader } = await import(
        '@/features/deputy-pages/deputy-loader'
      )

      return ({ params, request }) =>
        deputyLoader({
          deputyId: params.deputyId ?? '',
          signal: request.signal
        })
    }
  },
  [paths.findMyDeputy]: {
    Component: async () =>
      (await import('@/features/find-my-deputy/find-my-deputy-page'))
        .FindMyDeputyPage,
    loader: async () => {
      const { findMyDeputyLoader } = await import(
        '@/features/find-my-deputy/find-my-deputy-loader'
      )

      return ({ request }) => findMyDeputyLoader({ signal: request.signal })
    }
  },
  [paths.group]: {
    Component: async () =>
      (await import('@/features/group-pages/group-page')).GroupPage,
    loader: async () => {
      const { groupLoader } = await import(
        '@/features/group-pages/group-loader'
      )

      return ({ params, request }) =>
        groupLoader({
          groupId: params.groupId ?? '',
          signal: request.signal
        })
    }
  },
  [paths.groups]: {
    Component: async () =>
      (await import('@/features/group-pages/groups-page')).GroupsPage,
    loader: async () => {
      const { groupsLoader } = await import(
        '@/features/group-pages/groups-loader'
      )

      return ({ request }) => groupsLoader({ signal: request.signal })
    }
  },
  [paths.legal]: {
    Component: async () =>
      (await import('@/features/legal-page/legal-page')).LegalPage
  },
  [paths.method]: {
    Component: async () =>
      (await import('@/features/method-page/method-page')).MethodPage,
    loader: async () => {
      const { methodLoader } = await import(
        '@/features/method-page/method-loader'
      )

      return ({ request }) => methodLoader({ signal: request.signal })
    }
  },
  [paths.scrutin]: {
    Component: async () =>
      (await import('@/features/scrutin-pages/scrutin-page')).ScrutinPage,
    loader: async () => {
      const { scrutinLoader } = await import(
        '@/features/scrutin-pages/scrutin-loader'
      )

      return ({ params, request }) =>
        scrutinLoader({
          scrutinNumber: params.scrutinNumber ?? '',
          signal: request.signal
        })
    }
  },
  [paths.scrutins]: {
    Component: async () =>
      (await import('@/features/scrutin-pages/scrutins-page')).ScrutinsPage,
    loader: async () => {
      const { scrutinsLoader } = await import(
        '@/features/scrutin-pages/scrutins-loader'
      )

      return ({ request }) => scrutinsLoader({ signal: request.signal })
    }
  },
  [paths.senateScrutin]: {
    Component: async () =>
      (await import('@/features/senate-scrutin-pages/senate-scrutin-page'))
        .SenateScrutinPage,
    loader: async () => {
      const { senateScrutinLoader } = await import(
        '@/features/senate-scrutin-pages/senate-scrutin-loader'
      )

      return ({ params, request }) =>
        senateScrutinLoader({
          scrutinId: params.scrutinId ?? '',
          signal: request.signal
        })
    }
  },
  [paths.senateScrutins]: {
    Component: async () =>
      (await import('@/features/senate-scrutin-pages/senate-scrutins-page'))
        .SenateScrutinsPage,
    loader: async () => {
      const { senateScrutinsLoader } = await import(
        '@/features/senate-scrutin-pages/senate-scrutins-loader'
      )

      return ({ request }) => senateScrutinsLoader({ signal: request.signal })
    }
  },
  [paths.senator]: {
    Component: async () =>
      (await import('@/features/senator-pages/senator-page')).SenatorPage,
    loader: async () => {
      const { senatorLoader } = await import(
        '@/features/senator-pages/senator-loader'
      )

      return ({ params, request }) =>
        senatorLoader({
          senatorId: params.senatorId ?? '',
          signal: request.signal
        })
    }
  },
  [paths.senators]: {
    Component: async () =>
      (await import('@/features/senator-pages/senators-page')).SenatorsPage,
    loader: async () => {
      const { senatorsLoader } = await import(
        '@/features/senator-pages/senators-loader'
      )

      return ({ request }) => senatorsLoader({ signal: request.signal })
    }
  },
  [paths.voteMatch]: {
    Component: async () =>
      (await import('@/features/vote-match-page/vote-match-page'))
        .VoteMatchPage,
    loader: async () => {
      const { voteMatchLoader } = await import(
        '@/features/vote-match-page/vote-match-loader'
      )

      return ({ request }) => voteMatchLoader({ signal: request.signal })
    }
  }
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
  [paths.legal]: 'src/features/legal-page/legal-page.tsx',
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
 * A list's filters live in the query string: changing one must not reload the
 * page's data, which would suspend the list on every keystroke.
 */
const onlyWhenThePathChanges: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl
}) => currentUrl.pathname !== nextUrl.pathname

const routeFor = (path: RoutedPath): RouteObject => ({
  lazy: lazyRouteFor[path],
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
