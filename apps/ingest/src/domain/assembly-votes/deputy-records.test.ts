import { describe, expect, it } from 'vitest'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import { toDeputyRecords } from '@/domain/assembly-votes/deputy-records.ts'

const DEPUTY = 'PA722374'
const OTHER_DEPUTY = 'PA720334'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const scrutin = (
  number: number,
  overrides: Partial<ScrutinDetail> = {}
): ScrutinDetail => ({
  corrections: [],
  date: '2026-03-26',
  groups: [
    {
      ballots: [
        {
          byDelegation: true,
          cause: null,
          deputyId: DEPUTY,
          position: 'abstention'
        }
      ],
      groupId: 'PO845454',
      majorityPosition: 'for',
      memberCount: 36,
      totals: { ...noVotes, abstention: 1 }
    }
  ],
  kind: 'ordinary',
  legislativeFileId: null,
  number,
  outcome: 'adopted',
  requester: null,
  title: 'A scrutin',
  totals: noVotes,
  ...overrides
})

const recordOf = (scrutins: ScrutinDetail[]) => {
  const records = toDeputyRecords({
    deputyIds: [DEPUTY, OTHER_DEPUTY],
    scrutins
  })
  if (records.status === 'failure') throw new Error(records.error.code)
  return records.data
}

describe('toDeputyRecords', () => {
  it('[deputy-record] lists ballots newest scrutin first, with the position of the group they were listed under', () => {
    const [record] = recordOf([scrutin(4), scrutin(12), scrutin(7)])

    expect(record?.ballots.map((ballot) => ballot.scrutin)).toEqual([12, 7, 4])
    expect(record?.ballots[0]).toEqual({
      byDelegation: true,
      correction: null,
      groupPosition: 'for',
      position: 'abstention',
      scrutin: 12
    })
  })

  it('[correction] keeps the recorded position and puts the declared one beside it', () => {
    const [record] = recordOf([
      scrutin(5, { corrections: [{ deputyId: DEPUTY, intended: 'for' }] })
    ])

    expect(record?.ballots[0]?.position).toBe('abstention')
    expect(record?.ballots[0]?.correction).toBe('for')
  })

  it('[deputy-record] gives an empty record to a deputy who never voted', () => {
    expect(recordOf([scrutin(1)])[1]).toEqual({
      ballots: [],
      deputyId: OTHER_DEPUTY
    })
  })

  it('[deputy-record] refuses a ballot from a deputy it does not know', () => {
    const records = toDeputyRecords({ deputyIds: [], scrutins: [scrutin(9)] })

    expect(records).toEqual({
      error: { code: 'unknown_deputy', deputyId: DEPUTY, scrutin: 9 },
      status: 'failure'
    })
  })
})
