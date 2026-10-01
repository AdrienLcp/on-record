import { describe, expect, it } from 'vitest'

import type {
  ScrutinDetail,
  ScrutinKind
} from '@on-record/protocol/assembly/scrutin.ts'

import { toMajorVotes } from '@/domain/assembly-votes/major-votes.ts'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const scrutin = (number: number, kind: ScrutinKind): ScrutinDetail => ({
  corrections: [],
  date: '2026-03-26',
  groups: [
    {
      ballots: [
        { byDelegation: false, cause: null, deputyId: 'PA1', position: 'for' }
      ],
      groupId: 'PO845401',
      majorityPosition: 'for',
      memberCount: 123,
      totals: { ...noVotes, for: 120 }
    }
  ],
  kind,
  legislativeFileId: null,
  number,
  outcome: 'adopted',
  requester: null,
  title: `Scrutin ${number}`,
  totals: noVotes
})

describe('toMajorVotes', () => {
  const majorVotes = toMajorVotes([
    scrutin(4, 'solemn'),
    scrutin(9, 'ordinary'),
    scrutin(12, 'censure')
  ])

  it('[major-votes] keeps solemn votes and motions of censure, newest first', () => {
    expect(majorVotes.map((vote) => vote.number)).toEqual([12, 4])
  })

  it('[major-votes] keeps each group stance without its ballots', () => {
    expect(majorVotes[0]?.groups).toEqual([
      {
        groupId: 'PO845401',
        memberCount: 123,
        position: 'for',
        totals: { ...noVotes, for: 120 }
      }
    ])
  })
})
