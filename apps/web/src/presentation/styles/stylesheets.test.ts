import { globSync, readFileSync } from 'node:fs'

import {
  findTokenFailures,
  findTypeLiterals,
  findUnitFailures,
  findUnnamedValues
} from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const STYLESHEETS = globSync('src/**/*.{sass,css}')
const SOURCES = globSync('src/**/*.{sass,css,ts,tsx}').map((path) =>
  readFileSync(path, 'utf8')
)

/** Set at runtime by react-aria-components on a `Popover`, so no source of the app declares it. */
const SET_BY_REACT_ARIA = new Set(['--trigger-width'])

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readFileSync(path, 'utf8')

  it('[units] sizes text, spacing and boxes in rem', () => {
    expect(findUnitFailures(stylesheet)).toEqual([])
  })

  it.skipIf(path.endsWith('_typography.sass'))(
    '[type] takes its text voice from the typography mixins',
    () => {
      expect(findTypeLiterals(stylesheet)).toEqual([])
    }
  )

  it('[values] takes its radii and durations from tokens', () => {
    expect(findUnnamedValues(stylesheet)).toEqual([])
  })
})

it('[tokens] reads only custom properties that exist, under their one shared name', () => {
  expect(
    findTokenFailures(SOURCES).filter(
      ({ name }) => !SET_BY_REACT_ARIA.has(name)
    )
  ).toEqual([])
})
