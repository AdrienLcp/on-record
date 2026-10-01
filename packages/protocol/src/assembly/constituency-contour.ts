import { z } from 'zod'

import { departmentCodeSchema } from './official-ids'

/** `[longitude, latitude]`, in degrees (WGS 84), as GeoJSON orders them. */
const positionSchema = z.tuple([z.number(), z.number()])

/** A closed ring: its last position repeats the first. */
const ringSchema = z.array(positionSchema).min(4)

/** The outer ring first, then the holes, as in GeoJSON. */
const polygonSchema = z.array(ringSchema).min(1)

export const constituencyContourSchema = z.object({
  /** Number within the department. */
  constituency: z.number().int().positive(),
  polygons: z.array(polygonSchema).min(1)
})

/**
 * The contours of a department's constituencies that cut through a commune,
 * simplified: only they need an address to tell which one applies.
 */
export const constituencyContoursSchema = z.object({
  constituencies: z.array(constituencyContourSchema).min(1),
  department: departmentCodeSchema
})

export type ConstituencyContour = z.infer<typeof constituencyContourSchema>
export type ConstituencyContours = z.infer<typeof constituencyContoursSchema>
export type GeoPolygon = z.infer<typeof polygonSchema>
export type GeoPosition = z.infer<typeof positionSchema>
