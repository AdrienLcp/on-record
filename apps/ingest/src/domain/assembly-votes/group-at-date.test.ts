import { describe, expect, it } from 'vitest'

import {
  groupAtDate,
  toGroupMemberships
} from '@/domain/assembly-votes/group-at-date.ts'

const NON_ATTACHED = 'PO840056'
const LIOT = 'PO845485'
const SOCIALISTS = 'PO845419'

describe('toGroupMemberships', () => {
  it('[memberships] folds the mandates repeated per role into one spell', () => {
    expect(
      toGroupMemberships([
        { from: '2024-07-19', groupId: LIOT, to: '2025-11-12' },
        { from: '2025-03-01', groupId: LIOT, to: '2025-10-28' },
        { from: '2024-07-08', groupId: NON_ATTACHED, to: '2024-07-18' }
      ])
    ).toEqual([
      { from: '2024-07-08', groupId: NON_ATTACHED, to: '2024-07-18' },
      { from: '2024-07-19', groupId: LIOT, to: '2025-11-12' }
    ])
  })

  it('[memberships] keeps two spells in one group apart when the deputy left in between', () => {
    expect(
      toGroupMemberships([
        { from: '2024-07-19', groupId: LIOT, to: '2025-01-23' },
        { from: '2025-11-06', groupId: LIOT, to: null }
      ])
    ).toHaveLength(2)
  })
})

describe('groupAtDate', () => {
  const memberships = toGroupMemberships([
    { from: '2024-07-08', groupId: NON_ATTACHED, to: '2024-07-18' },
    { from: '2024-07-19', groupId: LIOT, to: '2025-02-28' },
    { from: '2025-03-01', groupId: SOCIALISTS, to: null }
  ])

  it('[group-at-date] gives the right group on each side of a change', () => {
    expect(groupAtDate(memberships, '2025-02-28')).toBe(LIOT)
    expect(groupAtDate(memberships, '2025-03-01')).toBe(SOCIALISTS)
    expect(groupAtDate(memberships, '2026-09-30')).toBe(SOCIALISTS)
  })

  it('[group-at-date] gives no group before the first spell', () => {
    expect(groupAtDate(memberships, '2024-07-01')).toBe(null)
  })
})
