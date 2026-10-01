import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'

import { seatHolderOf } from './seat-holder'

const deputy = (overrides: Partial<Deputy>): Deputy => ({
  birthDate: null,
  constituency: 3,
  department: { code: '75', name: 'Paris' },
  firstName: 'Camille',
  gender: 'female',
  groups: [],
  hatvpUrl: null,
  id: 'PA1',
  lastName: 'Durand',
  mandates: [{ from: '2024-07-08', to: null }],
  profession: null,
  ...overrides
})

const leftIn2025 = deputy({
  id: 'PA2',
  mandates: [{ from: '2024-07-08', to: '2025-01-23' }]
})
const leftIn2024 = deputy({
  id: 'PA3',
  mandates: [{ from: '2024-07-08', to: '2024-10-21' }]
})
const elsewhere = deputy({ constituency: 4, id: 'PA4' })

describe('seatHolderOf', () => {
  it('[seat] gives the deputy sitting for the constituency, not a former one', () => {
    expect(
      seatHolderOf({
        deputies: [leftIn2024, deputy({}), elsewhere],
        seat: { constituency: 3, department: '75' }
      })
    ).toEqual({ deputy: deputy({}), status: 'sitting' })
  })

  it('[seat] says a seat nobody holds is vacant, with its last holder', () => {
    expect(
      seatHolderOf({
        deputies: [leftIn2024, leftIn2025, elsewhere],
        seat: { constituency: 3, department: '75' }
      })
    ).toEqual({ lastHolder: leftIn2025, status: 'vacant' })
  })

  it('[seat] tells a constituency number apart across departments', () => {
    expect(
      seatHolderOf({
        deputies: [deputy({})],
        seat: { constituency: 3, department: '13' }
      })
    ).toEqual({ lastHolder: null, status: 'vacant' })
  })
})
