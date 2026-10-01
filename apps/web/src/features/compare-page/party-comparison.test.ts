import { describe, expect, it } from 'vitest'

import type {
  GroupStance,
  MajorVote
} from '@on-record/protocol/assembly/major-votes'
import type { ScrutinKind } from '@on-record/protocol/assembly/scrutin'

import {
  agreementSearchValue,
  type ComparedParty,
  campsOn,
  comparedKindSearchValue,
  comparedPartiesOf,
  comparedViewSearchValue,
  compareVotes,
  parseAgreement,
  parseComparedKind,
  parseComparedView,
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
      filters: { agreement: 'all', kind: 'solemn', query: '' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(matching)).toEqual([7, 3])
  })

  it('[compare] keeps only the votes where the groups part ways', () => {
    const { shown, split } = compareVotes({
      filters: { agreement: 'split', kind: 'solemn', query: '' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(split)).toEqual([7])
    expect(numbersOf(shown)).toEqual([7])
  })

  it('[compare] keeps only the votes where the groups stood together', () => {
    const { shown, together } = compareVotes({
      filters: { agreement: 'together', kind: 'solemn', query: '' },
      groupIds: [RN, LFI],
      votes
    })

    expect(numbersOf(together)).toEqual([3])
    expect(numbersOf(shown)).toEqual([3])
  })

  it('[compare] filters by the words of the title', () => {
    const { shown } = compareVotes({
      filters: { agreement: 'all', kind: 'solemn', query: 'retraite' },
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

describe('view and agreement in the URL', () => {
  it('[compare] opens on the ledger and leaves that default out of the URL', () => {
    expect(parseComparedView(null)).toBe('ledger')
    expect(parseComparedView('texts')).toBe('ledger')
    expect(parseComparedView('camps')).toBe('camps')
    expect(comparedViewSearchValue('ledger')).toBeNull()
    expect(comparedViewSearchValue('camps')).toBe('camps')
  })

  it('[compare] reads ecart=1 as the splits and ecart=0 as the agreements', () => {
    expect(parseAgreement('1')).toBe('split')
    expect(parseAgreement('0')).toBe('together')
    expect(parseAgreement(null)).toBe('all')
    expect(parseAgreement('yes')).toBe('all')
    expect(agreementSearchValue('all')).toBeNull()
    expect(agreementSearchValue('together')).toBe('0')
  })
})

describe('campsOn', () => {
  const parties = comparedPartiesOf(['rn', 'lfi', 'renaissance']).map(
    (party): ComparedParty => ({ group: undefined, party })
  )
  const partyIdsOf = (list: readonly { party: { id: string } }[]) =>
    list.map((each) => each.party.id)

  it('[compare] files each party under the stance its group took', () => {
    const groupIdOf = (id: string) =>
      parties.find((each) => each.party.id === id)?.party.groupId ?? ''
    const solemn = vote({
      groups: [
        stance(groupIdOf('rn')),
        stance(groupIdOf('lfi'), { position: 'against' })
      ],
      number: 1
    })
    const { aside, camps } = campsOn({ kind: 'solemn', parties, vote: solemn })

    expect(
      camps.map((camp) => [
        camp.stance,
        camp.parties.map((each) => each.party.id)
      ])
    ).toEqual([
      ['for', ['rn']],
      ['abstention', []],
      ['against', ['lfi']]
    ])
    expect(partyIdsOf(aside.map((each) => each.party))).toEqual(['renaissance'])
    expect(aside.map((each) => each.stance)).toEqual(['notListed'])
  })
})
