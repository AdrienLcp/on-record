import { describe, expect, it } from 'vitest'

import { PRESIDENTIAL_RACE, racePartyOfGroup } from './presidential-race'

describe('PRESIDENTIAL_RACE', () => {
  it('keeps only parties at or above the threshold, highest first', () => {
    const averages = PRESIDENTIAL_RACE.parties.map((party) => party.pollAverage)

    expect(
      averages.every((average) => average >= PRESIDENTIAL_RACE.thresholdPercent)
    ).toBe(true)
    expect(averages).toEqual([...averages].sort((a, b) => b - a))
  })

  it('gives each group to one party at most', () => {
    const groupIds = PRESIDENTIAL_RACE.parties.map((party) => party.groupId)

    expect(new Set(groupIds).size).toBe(groupIds.length)
  })
})

describe('racePartyOfGroup', () => {
  it('finds the party a group speaks for', () => {
    expect(racePartyOfGroup('PO845401')?.id).toBe('rn')
  })

  it('leaves allied groups out of the party they back', () => {
    expect(racePartyOfGroup('PO872880')).toBeNull()
    expect(racePartyOfGroup('PO845454')).toBeNull()
  })
})
