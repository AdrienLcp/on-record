import { globSync, readFileSync } from 'node:fs'

import { findTypeLiterals, findUnitFailures } from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const STYLESHEETS = globSync('src/**/*.{sass,css}')

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readFileSync(path, 'utf8')

  it('[units] sizes text and spacing in rem', () => {
    expect(findUnitFailures(stylesheet)).toEqual([])
  })

  it.skipIf(path.endsWith('_typography.sass'))(
    '[type] takes its text voice from the typography mixins',
    () => {
      expect(findTypeLiterals(stylesheet)).toEqual([])
    }
  )
})
