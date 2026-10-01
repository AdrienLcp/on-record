import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'

import {
  type DeputyFilters,
  departmentsOf,
  filterDeputies
} from './deputy-search'

const deputy = (overrides: Partial<Deputy>): Deputy => ({
  birthDate: null,
  constituency: 1,
  department: { code: '75', name: 'Paris' },
  firstName: 'Camille',
  gender: 'female',
  groups: [{ from: '2024-07-18', groupId: 'PO1', to: null }],
  hatvpUrl: null,
  id: 'PA1',
  lastName: 'Durand',
  mandates: [{ from: '2024-07-18', to: null }],
  profession: null,
  ...overrides
})

const NO_FILTER: DeputyFilters = {
  departmentCode: null,
  groupId: null,
  query: '',
  scope: 'all'
}

const switcher = deputy({
  groups: [
    { from: '2024-07-18', groupId: 'PO1', to: '2025-01-15' },
    { from: '2025-01-16', groupId: 'PO2', to: null }
  ],
  id: 'PA2',
  lastName: 'Richard'
})

const leaver = deputy({
  department: { code: '2A', name: 'Corse-du-Sud' },
  id: 'PA3',
  lastName: 'Michel',
  mandates: [{ from: '2024-07-18', to: '2025-06-30' }]
})

const deputies = [deputy({}), switcher, leaver]

describe('filterDeputies', () => {
  it('[deputies] keeps only sitting deputies unless the former are asked for', () => {
    const sitting = filterDeputies({
      deputies,
      filters: { ...NO_FILTER, scope: 'sitting' }
    })

    expect(sitting.map(({ id }) => id)).toEqual(['PA1', 'PA2'])
  })

  it('[deputies] files a deputy who changed group under the group of today', () => {
    const inFirstGroup = filterDeputies({
      deputies,
      filters: { ...NO_FILTER, groupId: 'PO1' }
    })

    expect(inFirstGroup.map(({ id }) => id)).toEqual(['PA1', 'PA3'])
  })

  it('[deputies] filters by department code', () => {
    const corsica = filterDeputies({
      deputies,
      filters: { ...NO_FILTER, departmentCode: '2A' }
    })

    expect(corsica.map(({ id }) => id)).toEqual(['PA3'])
  })

  it('[deputies] finds a name typed without accents or case', () => {
    const found = filterDeputies({
      deputies,
      filters: { ...NO_FILTER, query: 'RICHARD' }
    })

    expect(found.map(({ id }) => id)).toEqual(['PA2'])
  })
})

describe('departmentsOf', () => {
  it('[deputies] lists each department once, in code order', () => {
    const codes = departmentsOf([
      deputy({ department: { code: '971', name: 'Guadeloupe' } }),
      deputy({ department: { code: '13', name: 'Bouches-du-Rhône' } }),
      deputy({ department: { code: '2A', name: 'Corse-du-Sud' } }),
      deputy({ department: { code: '13', name: 'Bouches-du-Rhône' } })
    ]).map(({ code }) => code)

    expect(codes).toEqual(['2A', '13', '971'])
  })
})
