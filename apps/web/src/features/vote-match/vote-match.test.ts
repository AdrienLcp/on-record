import { describe, expect, it } from 'vitest'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import {
  answersSearchValue,
  countedTextsOf,
  matchedTextsOf,
  parseAnswers,
  sameChoiceCountOf,
  withAnswer
} from './vote-match'

const RN_GROUP = 'PO845401'
const LFI_GROUP = 'PO845413'

const voteOf = ({
  lfi,
  number,
  rn
}: {
  lfi: 'abstention' | 'against' | 'for' | null
  number: number
  rn?: 'abstention' | 'against' | 'for'
}): MajorVote => {
  const totals = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

  return {
    date: '2026-07-15',
    groups: [
      { groupId: LFI_GROUP, memberCount: 71, position: lfi, totals },
      ...(rn === undefined
        ? []
        : [{ groupId: RN_GROUP, memberCount: 122, position: rn, totals }])
    ],
    kind: 'solemn',
    legislativeFileId: null,
    number,
    outcome: 'adopted',
    title: `l'ensemble de la proposition de loi n° ${number}`,
    totals
  }
}

const texts = matchedTextsOf({
  entries: [
    { scrutin: 1, topic: 'endOfLife' },
    { scrutin: 2, topic: 'energy' },
    { scrutin: 3, topic: 'work' }
  ],
  votes: [
    voteOf({ lfi: 'for', number: 1, rn: 'against' }),
    voteOf({ lfi: null, number: 2, rn: 'abstention' }),
    voteOf({ lfi: 'against', number: 3 })
  ]
})

describe('parseAnswers', () => {
  it('reads each scrutin and its answer letter', () => {
    expect([...parseAnswers('8280p.8431c.7987a.7454n')]).toEqual([
      [8280, 'for'],
      [8431, 'against'],
      [7987, 'abstention'],
      [7454, 'unsure']
    ])
  })

  it('drops what it cannot read', () => {
    expect([...parseAnswers('8280x.p.12c..abc')]).toEqual([[12, 'against']])
    expect(parseAnswers(null).size).toBe(0)
  })

  it('writes back what it read', () => {
    const answers = withAnswer({
      answer: 'unsure',
      answers: parseAnswers('8280p'),
      scrutin: 8431
    })

    expect(answersSearchValue(answers)).toBe('8280p.8431n')
    expect(answersSearchValue(new Map())).toBeUndefined()
  })
})

describe('matchedTextsOf', () => {
  it('keeps the selection order and leaves out a scrutin not in the data', () => {
    expect(
      matchedTextsOf({
        entries: [
          { scrutin: 3, topic: 'work' },
          { scrutin: 9, topic: 'housing' },
          { scrutin: 1, topic: 'endOfLife' }
        ],
        votes: [
          voteOf({ lfi: 'for', number: 1 }),
          voteOf({ lfi: 'for', number: 3 })
        ]
      }).map((text) => text.vote.number)
    ).toEqual([3, 1])
  })
})

describe('sameChoiceCountOf', () => {
  const answers = parseAnswers('1p.2a.3n')

  it('counts only the texts answered for, against or abstaining', () => {
    expect(
      countedTextsOf({ answers, texts }).map((text) => text.vote.number)
    ).toEqual([1, 2])
  })

  it('matches an abstention only with an abstention', () => {
    expect(sameChoiceCountOf({ answers, groupId: RN_GROUP, texts })).toBe(1)
  })

  it('never matches a group with no majority or not sitting', () => {
    expect(sameChoiceCountOf({ answers, groupId: LFI_GROUP, texts })).toBe(1)
    expect(
      sameChoiceCountOf({
        answers: parseAnswers('3c'),
        groupId: RN_GROUP,
        texts
      })
    ).toBe(0)
  })
})
