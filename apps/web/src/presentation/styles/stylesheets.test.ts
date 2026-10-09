import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { REACT_ARIA_TOKENS } from '@adrienlcp/react-aria'
import {
  findFallbackFailures,
  findTokenFailures,
  findTypeLiterals,
  findUnitFailures,
  findUnnamedValues,
  webFontFamilies
} from '@adrienlcp/styles/audit'
import { describe, expect, it } from 'vitest'

const SOURCE_FOLDER = join(import.meta.dirname, '../..')

const findSourceFiles = (pattern: string) =>
  globSync(pattern, { cwd: SOURCE_FOLDER })

const readSourceFile = (path: string) =>
  readFileSync(join(SOURCE_FOLDER, path), 'utf8')

const STYLESHEETS = findSourceFiles('**/*.{sass,css}')
const SOURCES = findSourceFiles('**/*.{sass,css,ts,tsx}').map(readSourceFile)
const WEB_FONTS = webFontFamilies(STYLESHEETS.map(readSourceFile))

it('[sources] finds the stylesheets it audits', () => {
  expect(STYLESHEETS).not.toEqual([])
})

describe.each(STYLESHEETS)('%s', (path) => {
  const stylesheet = readSourceFile(path)

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

  it('[fonts] names the fallback face after every web font in a font token', () => {
    expect(findFallbackFailures(stylesheet, WEB_FONTS)).toEqual([])
  })
})

it('[tokens] reads only custom properties that exist, under their one shared name', () => {
  expect(findTokenFailures(SOURCES, { provided: REACT_ARIA_TOKENS })).toEqual(
    []
  )
})
