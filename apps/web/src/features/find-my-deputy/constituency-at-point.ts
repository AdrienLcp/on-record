import type {
  ConstituencyContour,
  GeoPolygon,
  GeoPosition
} from '@on-record/protocol/assembly/constituency-contour'

/**
 * Even-odd ray casting: a horizontal ray from the point crosses the ring an
 * odd number of times when the point is inside.
 */
const isInsideRing = (
  [longitude, latitude]: GeoPosition,
  ring: readonly GeoPosition[]
): boolean =>
  ring.reduce((isInside, [edgeEndLongitude, edgeEndLatitude], index) => {
    const [edgeStartLongitude, edgeStartLatitude] = ring.at(index - 1) ?? [
      edgeEndLongitude,
      edgeEndLatitude
    ]
    const spansLatitude =
      edgeEndLatitude > latitude !== edgeStartLatitude > latitude
    const crossingLongitude =
      ((edgeStartLongitude - edgeEndLongitude) * (latitude - edgeEndLatitude)) /
        (edgeStartLatitude - edgeEndLatitude) +
      edgeEndLongitude

    return spansLatitude && longitude < crossingLongitude ? !isInside : isInside
  }, false)

/** Inside the outer ring and outside every hole. */
const isInsidePolygon = (
  point: GeoPosition,
  [outerRing, ...holes]: GeoPolygon
): boolean =>
  outerRing !== undefined &&
  isInsideRing(point, outerRing) &&
  !holes.some((hole) => isInsideRing(point, hole))

/**
 * The constituency whose contour holds a point, or `null` when none does: a
 * point on a simplified boundary can fall between two.
 */
export const constituencyAtPoint = ({
  contours,
  point
}: {
  contours: readonly ConstituencyContour[]
  point: GeoPosition
}): number | null =>
  contours.find((contour) =>
    contour.polygons.some((polygon) => isInsidePolygon(point, polygon))
  )?.constituency ?? null
