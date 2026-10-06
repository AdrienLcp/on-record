import { describe, expect, it } from 'vitest'

import type { RawSenatorBallotRow } from '@/domain/senate-votes/raw-senate-rows.ts'
import { toSenateScrutin } from '@/domain/senate-votes/senate-scrutins.ts'

const ballot = (
  senmat: string,
  posvotcod: RawSenatorBallotRow['posvotcod']
): RawSenatorBallotRow => ({
  posvotcod,
  scrnum: 226,
  senmat,
  senmatdel: null,
  sesann: 2024,
  stavotidt: '0',
  votsenmar: '*'
})

describe('toSenateScrutin', () => {
  it('[senate] leaves out a correction naming the position already recorded', () => {
    const scrutin = toSenateScrutin({
      ballots: [ballot('95041E', '2'), ballot('14001X', '1')],
      corrections: [
        { intended: 'against', senatorId: '95041E' },
        { intended: 'against', senatorId: '14001X' }
      ],
      legislativeFile: null,
      membershipsOf: () => [{ from: '2023-10-02', groupId: 'LR', to: null }],
      row: {
        code: null,
        scrcon: 1,
        scrdat: '2025-03-11',
        scrint: "sur l'ensemble de la proposition de loi organique",
        scrnum: 226,
        scrpou: 1,
        scrsuf: 2,
        scrvot: 2,
        sesann: 2024
      }
    })

    expect(
      scrutin.status === 'success' ? scrutin.data.corrections : scrutin.error
    ).toEqual([{ intended: 'against', senatorId: '14001X' }])
  })
})
