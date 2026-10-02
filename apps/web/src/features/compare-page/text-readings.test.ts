import { describe, expect, it } from 'vitest'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import { stanceLeftBehind, textsOf } from './text-readings'

const noVotes = { abstention: 0, against: 0, for: 0, nonVoting: 0 }

const vote = ({
  date = '2026-03-26',
  legislativeFileId = null,
  number,
  title
}: {
  date?: string
  legislativeFileId?: string | null
  number: number
  title: string
}): MajorVote => ({
  date,
  groups: [],
  kind: 'solemn',
  legislativeFileId,
  number,
  outcome: 'adopted',
  title,
  totals: noVotes
})

const SPECIAL_LAW =
  "l'ensemble du projet de loi spéciale prévue par l'article 45 de la loi organique du 1er août 2001 relative aux lois de finances"

describe('textsOf', () => {
  it('files the readings of one text together, oldest first, latest text first', () => {
    const texts = textsOf([
      vote({
        number: 2107,
        title:
          'l’ensemble de la proposition de loi relative au droit à l’aide à mourir (première lecture).'
      }),
      vote({
        number: 5729,
        title:
          "l'ensemble de la proposition de loi relative au droit à l'aide à mourir (deuxième lecture)."
      }),
      vote({ number: 3000, title: `${SPECIAL_LAW} (première lecture).` })
    ])

    expect(
      texts.map((text) => text.readings.map((reading) => reading.number))
    ).toEqual([[2107, 5729], [3000]])
  })

  it('joins a reading to the file an earlier homonym reading carried', () => {
    const texts = textsOf([
      vote({
        number: 5729,
        title:
          "l'ensemble de la proposition de loi relative au droit à l'aide à mourir (deuxième lecture)."
      }),
      vote({
        legislativeFileId: 'DLR5L17N51670',
        number: 7894,
        title:
          "l'ensemble de la proposition de loi relative au droit à l'aide à mourir (nouvelle lecture)."
      })
    ])

    expect(texts).toHaveLength(1)
  })

  it('joins two titles the same file carries, whatever their spelling', () => {
    const texts = textsOf([
      vote({
        legislativeFileId: 'DLR5L17N53980',
        number: 8279,
        title:
          "l'ensemble du projet de loi visant à garantir la tranquillité (première lecture)."
      }),
      vote({
        legislativeFileId: 'DLR5L17N53980',
        number: 8433,
        title:
          "l'ensemble du projet de loi visant à garantir la tranquilité (texte de la commission mixte paritaire)."
      })
    ])

    expect(texts).toHaveLength(1)
    expect(texts[0]?.title).toMatchObject({
      subject: 'Garantir la tranquilité'
    })
  })

  it('opens a new text on a first reading of a name already seen', () => {
    const texts = textsOf([
      vote({ number: 525, title: `${SPECIAL_LAW} (première lecture).` }),
      vote({ number: 4947, title: `${SPECIAL_LAW} (première lecture).` })
    ])

    expect(texts).toHaveLength(2)
  })

  it('keeps apart two files that share a name', () => {
    const texts = textsOf([
      vote({
        legislativeFileId: 'DLR1',
        number: 1,
        title: "l'ensemble du projet de loi X (première lecture)."
      }),
      vote({
        legislativeFileId: 'DLR2',
        number: 2,
        title: "l'ensemble du projet de loi X (deuxième lecture)."
      })
    ])

    expect(texts).toHaveLength(2)
  })
})

describe('stanceLeftBehind', () => {
  it('gives the ballot position a party moved away from', () => {
    expect(stanceLeftBehind({ current: 'against', previous: 'for' })).toBe(
      'for'
    )
  })

  it('sees no change of mind on a first reading, a kept position, or an empty seat', () => {
    expect(stanceLeftBehind({ current: 'for', previous: undefined })).toBeNull()
    expect(stanceLeftBehind({ current: 'for', previous: 'for' })).toBeNull()
    expect(
      stanceLeftBehind({ current: 'for', previous: 'notListed' })
    ).toBeNull()
    expect(stanceLeftBehind({ current: 'none', previous: 'for' })).toBeNull()
  })
})
