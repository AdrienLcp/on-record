import { describe, expect, it } from 'vitest'

import { rawScrutinFileSchema } from '@/domain/assembly-votes/raw-scrutin.ts'
import {
  majorityPositionOf,
  toScrutinDetail
} from '@/domain/assembly-votes/scrutin-detail.ts'

import scrutinWithContradictedPosition from '../../../test/fixtures/scrutin-with-contradicted-position.json' with {
  type: 'json'
}
import scrutinWithCorrection from '../../../test/fixtures/scrutin-with-correction.json' with {
  type: 'json'
}
import scrutinWithMalfunction from '../../../test/fixtures/scrutin-with-malfunction.json' with {
  type: 'json'
}

const CORRECTED_DEPUTY = 'PA722374'
const ONE_VOTER_GROUP = 'PO845425'
const SILENT_GROUP = 'PO840056'
const RN_GROUP = 'PO845401'

const detailOf = (file: unknown) =>
  toScrutinDetail(rawScrutinFileSchema.parse(file).scrutin)

const groupOf = (file: unknown, groupId: string) => {
  const group = detailOf(file).groups.find((vote) => vote.groupId === groupId)
  if (group === undefined) throw new Error(`No group ${groupId} in fixture`)
  return group
}

describe('toScrutinDetail', () => {
  it('[buckets] reads a one-voter list written as a bare object', () => {
    const ballots = groupOf(scrutinWithCorrection, ONE_VOTER_GROUP).ballots

    expect(ballots.filter((ballot) => ballot.position === 'nonVoting')).toEqual(
      [
        {
          byDelegation: false,
          cause: 'MG',
          deputyId: 'PA408578',
          position: 'nonVoting'
        }
      ]
    )
  })

  it('[buckets] reads a null list as no ballot', () => {
    const ballots = groupOf(scrutinWithCorrection, ONE_VOTER_GROUP).ballots

    expect(ballots.filter((ballot) => ballot.position === 'against')).toEqual(
      []
    )
  })

  it('[delegation] flags a ballot cast by a colleague holding the delegation', () => {
    const ballots = groupOf(scrutinWithCorrection, ONE_VOTER_GROUP).ballots

    expect(
      ballots.find((ballot) => ballot.deputyId === 'PA718884')?.byDelegation
    ).toBe(true)
    expect(
      ballots.find((ballot) => ballot.deputyId === 'PA722390')?.byDelegation
    ).toBe(false)
  })

  it('[correction] keeps the recorded ballot and lists the declared vote beside it', () => {
    const detail = detailOf(scrutinWithCorrection)
    const recorded = detail.groups
      .flatMap((group) => group.ballots)
      .find((ballot) => ballot.deputyId === CORRECTED_DEPUTY)

    expect(recorded?.position).toBe('abstention')
    expect(detail.corrections).toEqual([
      { deputyId: CORRECTED_DEPUTY, intended: 'for' }
    ])
  })

  it('[correction] reads a vote the voting system failed to record as a correction', () => {
    expect(detailOf(scrutinWithMalfunction).corrections).toEqual([
      { deputyId: 'PA794786', intended: 'for' }
    ])
  })

  it('[majority] gives no majority to a group none of whose members voted', () => {
    expect(groupOf(scrutinWithCorrection, SILENT_GROUP).majorityPosition).toBe(
      null
    )
  })

  it('[majority] takes the members’ most frequent vote over the published position', () => {
    // Scrutin 8280: published "pour", members 12 for and 106 against.
    expect(
      groupOf(scrutinWithContradictedPosition, RN_GROUP).majorityPosition
    ).toBe('against')
  })

  it('[majority] gives no majority to a tie', () => {
    expect(
      majorityPositionOf({ abstention: 0, against: 3, for: 3, nonVoting: 1 })
    ).toBe(null)
    expect(
      majorityPositionOf({ abstention: 4, against: 3, for: 3, nonVoting: 0 })
    ).toBe('abstention')
  })

  it('[kind] maps the official vote type and refuses one it does not know', () => {
    const { scrutin } = scrutinWithCorrection
    const withType = (codeTypeVote: string) => ({
      scrutin: { ...scrutin, typeVote: { ...scrutin.typeVote, codeTypeVote } }
    })

    expect(detailOf(withType('MOC')).kind).toBe('censure')
    expect(detailOf(withType('SPS')).kind).toBe('solemn')
    expect(rawScrutinFileSchema.safeParse(withType('XYZ')).success).toBe(false)
  })

  it('[summary] links the scrutin to its legislative file', () => {
    expect(detailOf(scrutinWithCorrection).legislativeFileId).toBe(
      'DLR5L17N51346'
    )
  })
})
