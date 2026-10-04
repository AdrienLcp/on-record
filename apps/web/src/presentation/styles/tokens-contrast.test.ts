import { readFileSync } from 'node:fs'

import { findContrastFailures, WCAG_AA } from '@adrienlcp/styles/contrast'
import { describe, expect, it } from 'vitest'

const TOKENS = readFileSync(new URL('_tokens.sass', import.meta.url), 'utf8')

const SURFACES = ['--desk', '--card', '--accent-wash'] as const

const TEXT_INKS = ['--ink', '--ink-soft', '--accent'] as const

const MARKS = [
  '--focus',
  '--rule-strong',
  '--vote-for',
  '--vote-against',
  '--vote-abstention'
] as const

describe('colour tokens', () => {
  it('[contrast] every ink reads on every surface, in both themes', () => {
    expect(
      findContrastFailures(TOKENS, [
        ...SURFACES.flatMap((background) => [
          ...TEXT_INKS.map((foreground) => ({
            background,
            foreground,
            minimum: WCAG_AA.text
          })),
          ...MARKS.map((foreground) => ({
            background,
            foreground,
            minimum: WCAG_AA.nonText
          }))
        ]),
        {
          background: '--accent',
          foreground: '--on-accent',
          minimum: WCAG_AA.text
        }
      ])
    ).toEqual([])
  })
})
