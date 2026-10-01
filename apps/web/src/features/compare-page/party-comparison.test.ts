import { describe, expect, it } from 'vitest'

import type {
  GroupStance,
  MajorVote
} from '@on-record/protocol/assembly/major-votes'
import type { ScrutinKind } from '@on-record/protocol/assembly/scrutin'

import {
  comparedKindSearchValue,
  comparedPartiesOf,
  compareVotes,
  parseComparedKind,
  partyStanceOn
} from './party-comparison'

const RN = 'PO845401'
const LFI = 'PO845413'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const stance = (
  groupId: string,
  overrides: Partial<GroupStance> = {}
): GroupStance => ({
  groupId,
  memberCount: 100,
  position: 'for',
  totals: { ...noVotes, for: 90 },
  ...overrides
})

const vote = ({
  groups,
  kind = 'solemn',
  number,
  title = `Vote ${number}`
}: {
  groups: GroupStance[]
  kind?: ScrutinKind
  number: number
  title?: string
}): MajorVote => ({
  date: '2026-03-26',
  groups,
  kind,
  legislativeFileId: null,
  number,
  outcome: 'adopted',
  title,
  totals: noVotes
})

describe('partyStanceOn', () => {
  it('[compare] reads the published position on a solemn vote', () => {
    const solemn = vote({
      groups: [stance(RN, { position: 'against' })],
      number: 1
    })

    expect(partyStanceOn({ groupId: RN, vote: solemn }).stance).toBe('against')
  })

  it('[compare] says none when the Assemblée published no position', () => {
    const solemn = vote({ groups: [stance(RN, { position: null })], number: 1 })

    expect(partyStanceOn({ groupId: RN, vote: solemn }).stance).toBe('none')
  })

  it('[compare] says notListed when the group did not sit that day', () => {
    const solemn = vote({ groups: [stance(RN)], number: 1 })

    expect(partyStanceOn({ groupId: LFI, vote: solemn })).toEqual({
      record: null,
      stance: 'notListed'
    })
  })

  it('[compare] tells a censure backed by most members from a few voices', () => {
    const censure = vote({
      groups: [
        stance(RN, { totals: { ...noVotes, for: 51 } }),
        stance(LFI, { totals: { ...noVotes, for: 50 } })
      ],
      kind: 'censure',
      number: 1
    })

    expect(partyStanceOn({ groupId: RN, vote: censure }).stance).toBe('backed')
    expect(partyStanceOn({ groupId: LFI, vote: censure }).stance).toBe(
      'someVoices'
    )
  })

  it('[compare] says notBacked when no member voted the censure', () => {
    const censure = vote({
      groups: [stance(RN, { position: null, totals: noVotes })],
      kind: 'censure',
      number: 1
    })

    expect(partyStanceOn({ groupId: RN, vote: censure }).stance).toBe(
      'notBacked'
    )
  })
})

describe('compareVotes', () => {
  const votes = [
    vote({ groups: [stance(RN), stance(LFI)], number: 3, title: 'Le budget' }),
    vote({
      groups: [stance(RN), stance(LFI, { position: 'against' })],
      number: 7,
      title: 'Les retraites'
    }),
    vote({ groups: [stance(RN)], kind: 'censure', number: 9 })
  ]
  const numbersOf = (list: readonly MajorVote[]) =>
    list.map((each) => each.number)

  it('[compare] lists the chosen kind, newest first', () => {
    const { matching } = compareVotes({
      filters: { kind: 'solemn', onlySplit: false, query: '' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(matching)).toEqual([7, 3])
  })

  it('[compare] keeps only the votes where the groups part ways', () => {
    const { shown, split } = compareVotes({
      filters: { kind: 'solemn', onlySplit: true, query: '' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(split)).toEqual([7])
    expect(numbersOf(shown)).toEqual([7])
  })

  it('[compare] filters by the words of the title', () => {
    const { shown } = compareVotes({
      filters: { kind: 'solemn', onlySplit: false, query: 'retraite' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(shown)).toEqual([7])
  })
})

describe('compared parties and kind', () => {
  it('[compare] compares every race party when none is chosen', () => {
    expect(comparedPartiesOf([]).map((party) => party.id)).toEqual([
      'rn',
      'horizons',
      'lfi',
      'renaissance',
      'placePublique'
    ])
  })

  it('[compare] ignores the "other groups" choice', () => {
    expect(
      comparedPartiesOf(['others', 'lfi', 'rn']).map((party) => party.id)
    ).toEqual(['rn', 'lfi'])
  })

  it('[compare] opens on solemn votes and leaves that default out of the URL', () => {
    expect(parseComparedKind(null)).toBe('solemn')
    expect(parseComparedKind('ordinary')).toBe('solemn')
    expect(comparedKindSearchValue('solemn')).toBeNull()
    expect(comparedKindSearchValue('censure')).toBe('censure')
  })
})
