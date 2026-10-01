import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import { activeGroupsBySize, sittingMemberCounts } from './group-members'

const deputy = (
  id: string,
  groupIds: string[],
  leftOn: string | null = null
): Deputy => ({
  birthDate: null,
  constituency: 1,
  department: { code: '75', name: 'Paris' },
  firstName: 'Camille',
  gender: 'female',
  groups: groupIds.map((groupId, index) => ({
    from: `2024-0${index + 7}-01`,
    groupId,
    to: index === groupIds.length - 1 ? null : `2024-0${index + 7}-30`
  })),
  hatvpUrl: null,
  id,
  lastName: 'Durand',
  mandates: [{ from: '2024-07-18', to: leftOn }],
  profession: null
})

const group = (id: string, to: string | null = null): Group => ({
  color: null,
  from: '2024-07-18',
  id,
  name: id,
  shortName: id,
  to
})

describe('sittingMemberCounts', () => {
  it('[groups] counts each sitting deputy in the group of today only', () => {
    const counts = sittingMemberCounts([
      deputy('PA1', ['PO1']),
      deputy('PA2', ['PO1', 'PO2']),
      deputy('PA3', ['PO2'], '2025-01-01')
    ])

    expect(Object.fromEntries(counts)).toEqual({ PO1: 1, PO2: 1 })
  })
})

describe('activeGroupsBySize', () => {
  it('[groups] leaves dissolved groups out and puts the largest first', () => {
    const counts = new Map([
      ['PO1', 3],
      ['PO2', 12]
    ])
    const ordered = activeGroupsBySize({
      counts,
      groups: [group('PO1'), group('PO3', '2025-03-01'), group('PO2')]
    })

    expect(ordered.map(({ id }) => id)).toEqual(['PO2', 'PO1'])
  })
})
