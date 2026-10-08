import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

import { metricTwinFallbacks, srcWithTwins } from './metric-twin-fallbacks.ts'

describe('srcWithTwins', () => {
  it('lists Arial with the fonts drawn on its metrics', () => {
    expect(srcWithTwins('local("Arial")')).toBe(
      'local("Arial"), local("Liberation Sans"), local("Arimo"), local("Roboto")'
    )
  })

  it('reads an unquoted local name', () => {
    expect(srcWithTwins('local(Courier New)')).toBe(
      'local("Courier New"), local("Liberation Mono"), local("Cousine")'
    )
  })

  it('leaves a font without twins as it is', () => {
    expect(srcWithTwins('local("Segoe UI")')).toBe('local("Segoe UI")')
  })

  it('leaves a downloaded face as it is', () => {
    const src = 'url("/fonts/a.woff2") format("woff2")'

    expect(srcWithTwins(src)).toBe(src)
  })
})

it('rewrites the fallback faces fontaine wrote', async () => {
  const { css } = await postcss([metricTwinFallbacks()]).process(
    '@font-face{font-family:"A fallback";src:local("Arial")}',
    { from: undefined }
  )

  expect(css).toContain('local("Liberation Sans")')
})
