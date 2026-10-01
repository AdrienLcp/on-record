import { describe, expect, it } from 'vitest'

import {
  hasNoValidators,
  isNewerVersion,
  isSameContent
} from '@/domain/source-version.ts'

const cached = {
  etag: '"19192a7-65cbfd19393a1"',
  lastModified: 'Thu, 01 Oct 2026 04:26:24 GMT'
}

describe('isNewerVersion', () => {
  it('[stale-replica] ignores an older file served under another ETag', () => {
    expect(
      isNewerVersion({
        cached,
        downloaded: {
          etag: '"19192a7-65cbac9317b2b"',
          lastModified: 'Wed, 30 Sep 2026 22:26:09 GMT'
        }
      })
    ).toBe(false)
  })

  it('[stale-replica] takes a file modified after the cached one', () => {
    expect(
      isNewerVersion({
        cached,
        downloaded: {
          etag: '"1919300-65cc2a0000000"',
          lastModified: 'Fri, 02 Oct 2026 04:30:00 GMT'
        }
      })
    ).toBe(true)
  })

  it('[stale-replica] takes the first download when nothing is cached', () => {
    expect(isNewerVersion({ cached: null, downloaded: cached })).toBe(true)
  })
})

describe('isSameContent', () => {
  const bytes = new TextEncoder().encode('"COM","01001"')

  it('[no-validators] takes an identical file for an unchanged source', () => {
    expect(isSameContent({ cached: bytes, downloaded: bytes.slice() })).toBe(
      true
    )
  })

  it('[no-validators] takes one changed byte for a change', () => {
    expect(
      isSameContent({ cached: bytes, downloaded: bytes.with(-2, 50) })
    ).toBe(false)
  })

  it('[no-validators] tells a server without validators from one that sends them', () => {
    expect(hasNoValidators({ etag: null, lastModified: null })).toBe(true)
    expect(
      hasNoValidators({ etag: null, lastModified: cached.lastModified })
    ).toBe(false)
  })
})
