import { ignoreSupersededNavigation } from '@adrienlcp/react-router'
import {
  generatePath,
  isRouteErrorResponse,
  type PathParam,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
  useSearchParams
} from 'react-router'

import type {
  DeputyId,
  OrganId
} from '@on-record/protocol/assembly/official-ids'

/** Every page of the site; the URLs are French because the readers are. */
export const paths = {
  compare: '/comparer',
  deputies: '/deputes',
  deputy: '/deputes/:deputyId',
  findMyDeputy: '/mon-depute',
  group: '/groupes/:groupId',
  groups: '/groupes',
  home: '/',
  method: '/methode',
  scrutin: '/scrutins/:scrutinNumber',
  scrutins: '/scrutins'
} as const

export type RoutedPath = (typeof paths)[keyof typeof paths]

/**
 * The query parameters a list reads its filters from, so a figure or a link
 * elsewhere can open the list already filtered.
 */
export const searchParamNames = {
  agreement: 'ecart',
  amendmentOutcome: 'sort',
  amendmentStage: 'etape',
  answers: 'reponses',
  ballot: 'vote',
  commune: 'commune',
  department: 'departement',
  group: 'groupe',
  kind: 'type',
  outcome: 'resultat',
  parties: 'partis',
  query: 'q',
  scope: 'periode',
  step: 'fiche',
  view: 'vue'
} as const

export type SearchParamName = keyof typeof searchParamNames

export type SearchValues = Partial<Record<SearchParamName, string>>

const isSearchParamName = (name: string): name is SearchParamName =>
  name in searchParamNames

/** Where a list's filters are written in the URL, ending on its fragment. */
export const VOTES_FRAGMENT = 'votes'

export const AMENDMENTS_FRAGMENT = 'amendements'

const pathFor = <TPath extends string>(
  path: TPath,
  params: Record<PathParam<TPath>, string>
): string => generatePath<string>(path, params)

const withSearch = ({
  hash,
  path,
  search
}: {
  hash?: string
  path: string
  search: SearchValues
}): string => {
  const query = new URLSearchParams(
    Object.entries(search).flatMap(([name, value]) =>
      value === undefined || value === '' || !isSearchParamName(name)
        ? []
        : [[searchParamNames[name], value]]
    )
  ).toString()

  return `${path}${query === '' ? '' : `?${query}`}${hash === undefined ? '' : `#${hash}`}`
}

export const deputyPathFor = (
  deputyId: DeputyId,
  search: SearchValues = {}
): string =>
  withSearch({
    hash: Object.keys(search).length === 0 ? undefined : VOTES_FRAGMENT,
    path: pathFor(paths.deputy, { deputyId }),
    search
  })

/** A group's page; with filters, it opens on its list of votes. */
export const groupPathFor = (
  groupId: OrganId,
  search: SearchValues = {}
): string =>
  withSearch({
    hash: Object.keys(search).length === 0 ? undefined : VOTES_FRAGMENT,
    path: pathFor(paths.group, { groupId }),
    search
  })

export const scrutinPathFor = (scrutinNumber: number): string =>
  pathFor(paths.scrutin, { scrutinNumber: String(scrutinNumber) })

export const deputiesPathFor = (search: SearchValues): string =>
  withSearch({ path: paths.deputies, search })

/** The "find my deputy" page, already answering for a commune when one is given. */
export const findMyDeputyPathFor = (communeCode: string | null): string =>
  withSearch({
    path: paths.findMyDeputy,
    search: communeCode === null ? {} : { commune: communeCode }
  })

export const scrutinsPathFor = (search: SearchValues): string =>
  withSearch({ path: paths.scrutins, search })

export const useRouteData = <TLoader extends (...args: never[]) => unknown>() =>
  useLoaderData<TLoader>()

export const useCurrentPath = (): string => useLocation().pathname

/**
 * One filter kept in the URL: shareable, and restored by Back. Changing it
 * replaces the entry, so Back leaves the list instead of replaying each
 * keystroke, and keeps the scroll where it is.
 */
export const useSearchValue = (
  name: SearchParamName,
  {
    clears = []
  }: {
    /** Filters this one replaces: setting it removes them from the URL. */
    clears?: readonly SearchParamName[]
  } = {}
): [string | null, (value: string | null) => void] => {
  const [searchParams, setSearchParams] = useSearchParams()
  const key = searchParamNames[name]

  const setValue = (value: string | null): void => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        for (const cleared of clears) {
          next.delete(searchParamNames[cleared])
        }

        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }

        return next
      },
      { preventScrollReset: true, replace: true }
    )
  }

  return [searchParams.get(key), setValue]
}

/**
 * Several values set in one step, each history entry being a step a reader
 * can go Back to: two `useSearchValue` setters in a row would each start from
 * the same URL. An `undefined` value removes its parameter.
 */
export const useSetSearchValues = (): ((
  values: Partial<Record<SearchParamName, string | undefined>>
) => void) => {
  const [, setSearchParams] = useSearchParams()

  return (values) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)

        for (const name of Object.keys(values).filter(isSearchParamName)) {
          const value = values[name]

          if (value === undefined) {
            next.delete(searchParamNames[name])
          } else {
            next.set(searchParamNames[name], value)
          }
        }

        return next
      },
      { preventScrollReset: true }
    )
  }
}

/** Moves to a page after an action, such as a search submitted from the home page. */
export const useNavigateTo = (): ((path: string) => void) => {
  const navigate = useNavigate()

  return (path) => {
    void Promise.resolve(navigate(path)).catch(ignoreSupersededNavigation)
  }
}

/** The route error flattened to one line, whatever was thrown. */
export const useRouteFailure = (): string => {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`
  }

  return error instanceof Error ? error.message : String(error)
}
