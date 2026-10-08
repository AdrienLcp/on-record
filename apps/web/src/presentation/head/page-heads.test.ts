import { describe, expect, it } from 'vitest'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type { Senator } from '@on-record/protocol/senate/senator'

import { deputyHead, senatorHead } from './page-heads'
import { SITE_ORIGIN } from './site-origin'

const deputy: Deputy = {
  birthDate: null,
  constituency: 1,
  department: { code: '75', name: 'Paris' },
  firstName: 'Nathan',
  gender: 'male',
  groups: [{ from: '2024-07-18', groupId: 'PO1', to: null }],
  hatvpUrl: null,
  id: 'PA6',
  lastName: 'Richard',
  mandates: [{ from: '2024-07-18', to: null }],
  profession: null
}

const GROUP: Group = {
  color: null,
  from: '2024-07-18',
  id: 'PO1',
  name: 'Groupe du centre',
  shortName: 'EPR',
  to: null
}

const senator: Senator = {
  birthDate: null,
  constituency: { code: '75', name: 'Paris' },
  firstName: 'Claire',
  gender: 'female',
  groups: [{ from: '2023-10-02', groupId: 'UC', to: null }],
  hatvpUrl: null,
  id: '12345A',
  lastName: 'Martin',
  mandates: [{ from: '2023-10-02', to: null }],
  profession: null
}

const SENATE_GROUP: SenateGroup = {
  color: null,
  id: 'UC',
  name: 'Groupe du Sénat',
  shortName: 'UC'
}

describe('deputyHead', () => {
  it('describes the deputy as a Person of the Assemblée and their group', () => {
    expect(
      deputyHead({ deputy, groups: [GROUP], path: '/deputes/PA6' })
        .structuredData
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      memberOf: [
        { '@type': 'GovernmentOrganization', name: 'Assemblée nationale' },
        {
          '@type': 'Organization',
          alternateName: 'EPR',
          name: 'Groupe du centre'
        }
      ],
      name: 'Nathan Richard',
      url: `${SITE_ORIGIN}/deputes/PA6`
    })
  })

  it('names no group for a deputy who sits in none', () => {
    expect(
      deputyHead({ deputy, groups: [], path: '/deputes/PA6' }).structuredData
        ?.memberOf
    ).toEqual([
      { '@type': 'GovernmentOrganization', name: 'Assemblée nationale' }
    ])
  })
})

describe('senatorHead', () => {
  it('describes the senator as a Person of the Sénat and their group', () => {
    expect(
      senatorHead({
        groups: [SENATE_GROUP],
        path: '/senat/12345A',
        senator
      }).structuredData
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      memberOf: [
        { '@type': 'GovernmentOrganization', name: 'Sénat' },
        {
          '@type': 'Organization',
          alternateName: 'UC',
          name: 'Groupe du Sénat'
        }
      ],
      name: 'Claire Martin',
      url: `${SITE_ORIGIN}/senat/12345A`
    })
  })
})
