import { describe, expect, it } from 'vitest'

import { isNewerArchive } from '@/domain/assembly-votes/archive-version.ts'

const cached = {
  etag: '"19192a7-65cbfd19393a1"',
  lastModified: 'Thu, 01 Oct 2026 04:26:24 GMT'
}

describe('isNewerArchive', () => {
  it('[stale-replica] ignores an older file served under another ETag', () => {
    expect(
      isNewerArchive({
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
      isNewerArchive({
        cached,
        downloaded: {
          etag: '"1919300-65cc2a0000000"',
          lastModified: 'Fri, 02 Oct 2026 04:30:00 GMT'
        }
      })
    ).toBe(true)
  })

  it('[stale-replica] takes the first download when nothing is cached', () => {
    expect(isNewerArchive({ cached: null, downloaded: cached })).toBe(true)
  })
})
