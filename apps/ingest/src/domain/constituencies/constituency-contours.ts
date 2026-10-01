import type {
  ConstituencyContours,
  GeoPolygon,
  GeoPosition
} from '@on-record/protocol/assembly/constituency-contour.ts'
import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids.ts'

import type { CommunePlacement } from '@/domain/constituencies/commune-placement.ts'
import { assemblyDepartmentOf } from '@/domain/constituencies/official-departments.ts'
import type { RawContours } from '@/domain/constituencies/raw-geography.ts'

/** About 10 m on the ground: the precision the published contours already have. */
const COORDINATE_DECIMALS = 4

const SMALLEST_RING = 4

const roundCoordinate = (value: number): number =>
  Number(value.toFixed(COORDINATE_DECIMALS))

const isSamePosition = (left: GeoPosition, right: GeoPosition | undefined) =>
  right !== undefined && left[0] === right[0] && left[1] === right[1]

const simplifyRing = (ring: readonly GeoPosition[]): GeoPosition[] =>
  ring
    .map(
      ([longitude, latitude]): GeoPosition => [
        roundCoordinate(longitude),
        roundCoordinate(latitude)
      ]
    )
    .filter(
      (position, index, rounded) =>
        !isSamePosition(position, rounded[index - 1])
    )

const simplifyPolygon = (polygon: readonly GeoPosition[][]): GeoPolygon =>
  polygon.map(simplifyRing).filter((ring) => ring.length >= SMALLEST_RING)

const constituencyNumberOf = (code: string): number => Number(code.slice(-2))

/**
 * The contours an address must be tested against: for each department, the
 * constituencies that cut through one of its communes, and only those.
 */
export const toConstituencyContours = ({
  contours,
  placements
}: {
  contours: RawContours
  placements: Iterable<CommunePlacement>
}): ConstituencyContours[] => {
  const neededByDepartment = new Map<DepartmentCode, Set<number>>()
  for (const placement of placements) {
    if (placement.constituencies.length < 2) continue
    const needed = neededByDepartment.get(placement.department) ?? new Set()
    for (const constituency of placement.constituencies)
      needed.add(constituency)
    neededByDepartment.set(placement.department, needed)
  }

  const byDepartment = new Map<DepartmentCode, ConstituencyContours>()
  for (const feature of contours.features) {
    const department = assemblyDepartmentOf(feature.properties.codeDepartement)
    const constituency = constituencyNumberOf(
      feature.properties.codeCirconscription
    )
    if (!neededByDepartment.get(department)?.has(constituency)) continue
    const polygons = (
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates
    )
      .map(simplifyPolygon)
      .filter((polygon) => polygon.length > 0)
    const departmentContours = byDepartment.get(department) ?? {
      constituencies: [],
      department
    }
    byDepartment.set(department, {
      ...departmentContours,
      constituencies: [
        ...departmentContours.constituencies,
        { constituency, polygons }
      ].toSorted((left, right) => left.constituency - right.constituency)
    })
  }
  return [...byDepartment.values()].toSorted((left, right) =>
    left.department.localeCompare(right.department)
  )
}

/** Split communes whose constituencies have no contour: an address there cannot be placed. */
export const findMissingContours = ({
  contours,
  placements
}: {
  contours: readonly ConstituencyContours[]
  placements: Iterable<CommunePlacement>
}): string[] => {
  const available = new Set(
    contours.flatMap((department) =>
      department.constituencies.map(
        (contour) => `${department.department}-${contour.constituency}`
      )
    )
  )
  return [...placements]
    .filter((placement) => placement.constituencies.length > 1)
    .flatMap((placement) =>
      placement.constituencies.map(
        (constituency) => `${placement.department}-${constituency}`
      )
    )
    .filter(
      (key, index, keys) => !available.has(key) && keys.indexOf(key) === index
    )
}
