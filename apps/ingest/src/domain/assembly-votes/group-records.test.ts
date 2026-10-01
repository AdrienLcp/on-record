import { describe, expect, it } from 'vitest'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import { toGroupRecords } from '@/domain/assembly-votes/group-records.ts'

const GROUP = 'PO845454'
const OTHER_GROUP = 'PO845401'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const scrutin = (number: number, groupId = GROUP): ScrutinDetail => ({
  corrections: [],
  date: '2026-03-26',
  groups: [
    {
      ballots: [],
      groupId,
      majorityPosition: 'against',
      memberCount: 36,
      totals: { ...noVotes, against: 30, for: 2 }
    }
  ],
  kind: 'ordinary',
  legislativeFileId: null,
  number,
  outcome: 'rejected',
  requester: null,
  title: 'A scrutin',
  totals: noVotes
})

describe('toGroupRecords', () => {
  it('[group-record] lists the scrutins a group was listed in, newest first, with its published position', () => {
    const records = toGroupRecords({
      groupIds: [GROUP, OTHER_GROUP],
      scrutins: [scrutin(4), scrutin(12), scrutin(7, OTHER_GROUP)]
    })

    expect(records.status).toBe('success')
    if (records.status === 'failure') return
    const [record, otherRecord] = records.data
    expect(record?.votes.map((vote) => vote.scrutin)).toEqual([12, 4])
    expect(record?.votes[0]).toEqual({
      memberCount: 36,
      position: 'against',
      scrutin: 12,
      totals: { ...noVotes, against: 30, for: 2 }
    })
    expect(otherRecord?.votes.map((vote) => vote.scrutin)).toEqual([7])
  })

  it('[group-record] gives a group listed nowhere an empty record', () => {
    const records = toGroupRecords({ groupIds: [GROUP], scrutins: [] })

    expect(records).toEqual({
      data: [{ groupId: GROUP, votes: [] }],
      status: 'success'
    })
  })

  it('[group-record] fails on a scrutin that lists an unknown group', () => {
    const records = toGroupRecords({
      groupIds: [GROUP],
      scrutins: [scrutin(4, OTHER_GROUP)]
    })

    expect(records).toEqual({
      error: { code: 'unknown_group', groupId: OTHER_GROUP },
      status: 'failure'
    })
  })
})
