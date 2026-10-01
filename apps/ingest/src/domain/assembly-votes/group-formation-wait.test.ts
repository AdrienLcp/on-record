import { describe, expect, it } from 'vitest'

import {
  NON_ATTACHED_GROUP_ID,
  withoutWaitForGroups
} from '@/domain/assembly-votes/group-formation-wait.ts'

const LIOT = 'PO845485'

describe('withoutWaitForGroups', () => {
  it('[group-formation] drops the non-attached days before the groups were declared', () => {
    expect(
      withoutWaitForGroups([
        {
          from: '2024-07-08',
          groupId: NON_ATTACHED_GROUP_ID,
          to: '2024-07-18'
        },
        { from: '2024-07-19', groupId: LIOT, to: null }
      ])
    ).toEqual([{ from: '2024-07-19', groupId: LIOT, to: null }])
  })

  it('[group-formation] keeps a deputy who stayed non-attached', () => {
    const stayed = [
      { from: '2024-07-08', groupId: NON_ATTACHED_GROUP_ID, to: null }
    ]

    expect(withoutWaitForGroups(stayed)).toEqual(stayed)
  })

  it('[group-formation] keeps a non-attached spell that ends with the seat, before any group', () => {
    const leftEarly = [
      { from: '2024-07-08', groupId: NON_ATTACHED_GROUP_ID, to: '2024-07-18' }
    ]

    expect(withoutWaitForGroups(leftEarly)).toEqual(leftEarly)
  })

  it('[group-formation] keeps a non-attached spell later in the legislature', () => {
    const spells = [
      { from: '2024-07-19', groupId: LIOT, to: '2024-10-21' },
      { from: '2025-11-06', groupId: NON_ATTACHED_GROUP_ID, to: '2025-11-07' },
      { from: '2025-11-08', groupId: LIOT, to: null }
    ]

    expect(withoutWaitForGroups(spells)).toEqual(spells)
  })
})
