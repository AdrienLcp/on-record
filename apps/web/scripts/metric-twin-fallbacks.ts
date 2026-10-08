import type { AtRule, Plugin } from 'postcss'

/**
 * The fonts drawn on the same metrics as each one fontaine scales its
 * fallback faces to. Linux has no Arial and Android has only Roboto: without
 * its twins, the fallback face fails to load there and the swap moves every
 * line.
 */
export const METRIC_TWINS: Readonly<Record<string, readonly string[]>> = {
  Arial: ['Arial', 'Liberation Sans', 'Arimo', 'Roboto'],
  'Courier New': ['Courier New', 'Liberation Mono', 'Cousine']
}

const LOCAL_SOURCE = /^local\((["']?)(?<font>[^"')]+)\1\)$/

/** The `src` of a fallback face that reads `font`, with its metric twins. */
export const srcWithTwins = (src: string): string => {
  const font = LOCAL_SOURCE.exec(src.trim())?.groups?.font
  const twins = font === undefined ? undefined : METRIC_TWINS[font]

  return twins === undefined
    ? src
    : twins.map((twin) => `local("${twin}")`).join(', ')
}

/**
 * Runs after `fontaine/postcss` and widens each fallback face it wrote on a
 * font that has metric twins to all of them.
 */
export const metricTwinFallbacks = (): Plugin => ({
  AtRule: {
    'font-face': (rule: AtRule) => {
      rule.walkDecls('src', (declaration) => {
        declaration.value = srcWithTwins(declaration.value)
      })
    }
  },
  postcssPlugin: 'metric-twin-fallbacks'
})
