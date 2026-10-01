import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids.ts'

/** A commune of the Ministry's table, under its INSEE code of the time. */
export type TableCommune = {
  code: string
  constituencies: readonly number[]
  department: DepartmentCode
}

/** A commune of today's map (INSEE, Code officiel géographique). */
export type CurrentCommune = {
  /** `null` overseas, where the COG files no canton. */
  canton: string | null
  code: string
  department: DepartmentCode
}

/** One commune code becoming another: a merger, a restoration, a new code. */
export type CommuneMove = { from: string; to: string }

/** Where a current commune votes: one department, one or several constituencies. */
export type CommunePlacement = {
  constituencies: number[]
  department: DepartmentCode
}

/**
 * How each current commune was placed, for the run log:
 * - `table` — through the table, its code unchanged or followed through mergers
 * - `restored` — a commune split back out of a merger, placed like the one it left
 * - `singleConstituency` — in a department or collectivity with one constituency
 * - `canton` — a commune the table never listed (a "village mort pour la
 *   France" has no voters), placed like the rest of its canton when that lies
 *   in one constituency
 */
export type PlacementSource =
  | 'canton'
  | 'restored'
  | 'singleConstituency'
  | 'table'

export type PlacementReport = {
  placedBy: Record<PlacementSource, number>
  /** Table communes that lead to no current commune. */
  unmatchedTableCommunes: string[]
  /** Current communes no rule could place. */
  unplacedCommunes: string[]
}

const constituencyKey = (department: DepartmentCode, constituency: number) =>
  `${department}:${constituency}`

const addPlacement = (
  placements: Map<string, CommunePlacement>,
  code: string,
  { constituencies, department }: CommunePlacement
): void => {
  const placed = placements.get(code)
  const merged = new Set([...(placed?.constituencies ?? []), ...constituencies])
  placements.set(code, {
    constituencies: [...merged].toSorted((left, right) => left - right),
    department: placed?.department ?? department
  })
}

const groupBy = <Item>(
  items: readonly Item[],
  keyOf: (item: Item) => string
): ReadonlyMap<string, Item[]> =>
  items.reduce((groups, item) => {
    const key = keyOf(item)
    return groups.set(key, [...(groups.get(key) ?? []), item])
  }, new Map<string, Item[]>())

/**
 * Places every current commune in its constituencies. The table predates
 * the communes merged since 2017: a table code that is no longer current is
 * followed through the moves to the communes it became, and a merged commune
 * whose parts voted in different constituencies keeps them all — the
 * electoral map did not move with the merger.
 */
export const placeCommunes = ({
  currentCommunes,
  moves,
  tableCommunes
}: {
  currentCommunes: readonly CurrentCommune[]
  moves: readonly CommuneMove[]
  tableCommunes: readonly TableCommune[]
}): { placements: Map<string, CommunePlacement>; report: PlacementReport } => {
  const currentByCode = new Map(
    currentCommunes.map((commune) => [commune.code, commune])
  )
  const movesFrom = groupBy(moves, (move) => move.from)
  const movesTo = groupBy(moves, (move) => move.to)
  const placements = new Map<string, CommunePlacement>()
  const placedBy: Record<PlacementSource, number> = {
    canton: 0,
    restored: 0,
    singleConstituency: 0,
    table: 0
  }

  const currentCodesOf = (
    code: string,
    visited: ReadonlySet<string> = new Set()
  ): string[] => {
    if (currentByCode.has(code)) return [code]
    if (visited.has(code)) return []
    const seen = new Set([...visited, code])
    return [
      ...new Set(
        (movesFrom.get(code) ?? []).flatMap((move) =>
          currentCodesOf(move.to, seen)
        )
      )
    ]
  }

  const unmatchedTableCommunes: string[] = []
  for (const tableCommune of tableCommunes) {
    const currentCodes = currentCodesOf(tableCommune.code)
    if (currentCodes.length === 0)
      unmatchedTableCommunes.push(tableCommune.code)
    for (const code of currentCodes) {
      addPlacement(placements, code, {
        constituencies: [...tableCommune.constituencies],
        department: tableCommune.department
      })
    }
  }
  placedBy.table = placements.size

  const tableByCode = new Map(
    tableCommunes.map((commune) => [commune.code, commune])
  )
  const unplaced = () =>
    currentCommunes.filter((commune) => !placements.has(commune.code))

  for (const commune of unplaced()) {
    const sources = (movesTo.get(commune.code) ?? []).flatMap((move) => {
      const source = placements.get(move.from) ?? tableByCode.get(move.from)
      return source === undefined ? [] : [source]
    })
    for (const source of sources) {
      addPlacement(placements, commune.code, {
        constituencies: [...source.constituencies],
        department: source.department
      })
    }
    if (sources.length > 0) placedBy.restored++
  }

  const constituenciesByDepartment = groupBy(
    [
      ...new Set(
        tableCommunes.flatMap((commune) =>
          commune.constituencies.map((constituency) =>
            constituencyKey(commune.department, constituency)
          )
        )
      )
    ],
    (key) => key.split(':')[0] ?? ''
  )
  for (const commune of unplaced()) {
    const departmentConstituencies =
      constituenciesByDepartment.get(commune.department) ?? []
    if (departmentConstituencies.length === 1) {
      addPlacement(placements, commune.code, {
        constituencies: [1],
        department: commune.department
      })
      placedBy.singleConstituency++
    }
  }

  const placedByCanton = groupBy(
    currentCommunes.filter(
      (commune) => commune.canton !== null && placements.has(commune.code)
    ),
    (commune) => commune.canton ?? ''
  )
  for (const commune of unplaced()) {
    if (commune.canton === null) continue
    const cantonPlacements = (placedByCanton.get(commune.canton) ?? []).flatMap(
      (neighbour) => {
        const placement = placements.get(neighbour.code)
        return placement === undefined ? [] : [placement]
      }
    )
    const cantonConstituencies = new Set(
      cantonPlacements.flatMap((placement) =>
        placement.constituencies.map((constituency) =>
          constituencyKey(placement.department, constituency)
        )
      )
    )
    const [onlyPlacement] = cantonPlacements
    if (cantonConstituencies.size === 1 && onlyPlacement !== undefined) {
      addPlacement(placements, commune.code, onlyPlacement)
      placedBy.canton++
    }
  }

  return {
    placements,
    report: {
      placedBy,
      unmatchedTableCommunes,
      unplacedCommunes: unplaced().map((commune) => commune.code)
    }
  }
}
