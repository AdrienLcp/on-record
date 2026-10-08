import { describe, expect, it } from 'vitest'

import { toDeputy } from '@/domain/assembly-votes/deputy.ts'
import { groupAtDate } from '@/domain/assembly-votes/group-at-date.ts'
import {
  isLegislatureDeputyFile,
  rawDeputyFileSchema
} from '@/domain/assembly-votes/raw-actor.ts'

import actorBackFromGovernment from '../../../test/fixtures/actor-back-from-government.json' with {
  type: 'json'
}
import actorWhoChangedGroup from '../../../test/fixtures/actor-who-changed-group.json' with {
  type: 'json'
}

const deputyOf = (file: unknown) => {
  const deputy = toDeputy(rawDeputyFileSchema.parse(file).acteur)
  if (deputy.status === 'failure') throw new Error(deputy.error.code)
  return deputy.data
}

describe('toDeputy', () => {
  it('[hatvp] has no HATVP page while the Assemblée points to its own placeholder', () => {
    const newcomer = {
      acteur: {
        ...actorWhoChangedGroup.acteur,
        uri_hatvp: '/tribun/resources/html/defautDeclarationActeur.html'
      }
    }

    expect(deputyOf(newcomer).hatvpUrl).toBeNull()
  })

  it('[group-at-date] places a deputy who changed group in each group on its side of the change', () => {
    const { groups } = deputyOf(actorWhoChangedGroup)

    expect(groupAtDate(groups, '2024-09-11')).toBe('PO845520')
    expect(groupAtDate(groups, '2024-09-12')).toBe('PO847173')
    expect(groupAtDate(groups, '2025-09-05')).toBe('PO872880')
  })

  it('[seats] starts a seat on the day the deputy took it, not on election day', () => {
    expect(deputyOf(actorWhoChangedGroup).mandates).toEqual([
      { from: '2024-07-08', to: null }
    ])
  })

  it('[seats] keeps both seat periods of a deputy who left for the government and came back', () => {
    expect(deputyOf(actorBackFromGovernment).mandates).toEqual([
      { from: '2024-07-08', to: '2024-10-21' },
      { from: '2025-11-06', to: null }
    ])
  })

  it('[group-formation] keeps the groups of a returning minister without the wait for groups to form', () => {
    expect(deputyOf(actorBackFromGovernment).groups).toEqual([
      { from: '2024-07-19', groupId: 'PO845485', to: '2024-10-21' },
      { from: '2025-11-06', groupId: 'PO840056', to: '2025-11-07' },
      { from: '2025-11-08', groupId: 'PO845485', to: null }
    ])
  })

  it('[seats] reads the constituency and the civility of the deputy', () => {
    const deputy = deputyOf(actorWhoChangedGroup)

    expect(deputy.department).toEqual({ code: '51', name: 'Marne' })
    expect(deputy.constituency).toBe(3)
    expect(deputy.gender).toBe('male')
  })

  it('[screen] tells a deputy of the legislature from another actor', () => {
    const { acteur } = actorWhoChangedGroup
    const withoutSeat = {
      acteur: {
        ...acteur,
        mandats: {
          mandat: acteur.mandats.mandat.filter(
            (mandate) => mandate.typeOrgane !== 'ASSEMBLEE'
          )
        }
      }
    }

    expect(isLegislatureDeputyFile(actorWhoChangedGroup)).toBe(true)
    expect(isLegislatureDeputyFile(withoutSeat)).toBe(false)
  })
})
