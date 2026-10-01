import { describe, expect, it } from 'vitest'

import type { ConstituencyContour } from '@on-record/protocol/assembly/constituency-contour'

import { constituencyAtPoint } from './constituency-at-point'

/** Two squares side by side: the left one with a square hole, the right one with an island. */
const contours: ConstituencyContour[] = [
  {
    constituency: 1,
    polygons: [
      [
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
          [0, 0]
        ],
        [
          [0.5, 0.5],
          [1, 0.5],
          [1, 1],
          [0.5, 1],
          [0.5, 0.5]
        ]
      ]
    ]
  },
  {
    constituency: 2,
    polygons: [
      [
        [
          [2, 0],
          [4, 0],
          [4, 2],
          [2, 2],
          [2, 0]
        ]
      ],
      [
        [
          [10, 10],
          [11, 10],
          [11, 11],
          [10, 10]
        ]
      ]
    ]
  }
]

const at = (longitude: number, latitude: number) =>
  constituencyAtPoint({ contours, point: [longitude, latitude] })

describe('constituencyAtPoint', () => {
  it('[point-in-polygon] finds the constituency holding the point', () => {
    expect(at(1.5, 1.5)).toBe(1)
    expect(at(3, 1)).toBe(2)
  })

  it('[point-in-polygon] reads a point in a hole as outside the polygon', () => {
    expect(at(0.75, 0.75)).toBe(null)
  })

  it('[point-in-polygon] finds a point on the island of a constituency', () => {
    expect(at(10.8, 10.5)).toBe(2)
  })

  it('[point-in-polygon] gives no constituency outside every contour', () => {
    expect(at(5, 5)).toBe(null)
  })
})
