import { describe, expect, it } from 'vitest'

import type { MajorVote } from '@on-record/protocol/assembly/major-votes'

import {
  censureMotionOf,
  readingStageOf,
  stanceLeftBehind,
  textNameOf,
  textsOf
} from './text-readings'

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

describe('textNameOf', () => {
  it('names the text without what was voted of it nor the stage', () => {
    expect(
      textNameOf(
        'l’ensemble de la proposition de loi relative au droit à l’aide à mourir (première lecture).'
      )
    ).toBe("Proposition de loi relative au droit à l'aide à mourir")
  })

  it('names a budget part by its bill', () => {
    expect(
      textNameOf(
        'la première partie du projet de loi de finances pour 2026 (première lecture).'
      )
    ).toBe('Projet de loi de finances pour 2026')
  })

  it('drops the constitutional article a declaration applies', () => {
    expect(
      textNameOf(
        "la déclaration du Gouvernement portant sur la stratégie de défense nationale (application de l'article 50-1 de la Constitution)."
      )
    ).toBe(
      'Déclaration du Gouvernement portant sur la stratégie de défense nationale'
    )
  })
})

describe('readingStageOf', () => {
  it('reads the stage the title closes on', () => {
    expect(
      readingStageOf(
        "l'ensemble du projet de loi d'urgence pour Mayotte (texte de la commission mixte paritaire)."
      )
    ).toBe('jointCommittee')
    expect(readingStageOf(`${SPECIAL_LAW} (lecture définitive).`)).toBe(
      'finalReading'
    )
  })

  it('has none for a vote outside the shuttle', () => {
    expect(
      readingStageOf(
        "l'article unique de la proposition de résolution européenne appelant au renforcement du soutien à l'Ukraine."
      )
    ).toBeNull()
  })
})

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
    expect(texts[0]?.name).toBe(
      'Projet de loi visant à garantir la tranquilité'
    )
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

describe('censureMotionOf', () => {
  it('reads who tabled the motion, and whether it answers a 49.3', () => {
    expect(
      censureMotionOf(
        "la motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution par Mme Marine Le Pen, M. Éric Ciotti et 104 députés."
      )
    ).toEqual({
      afterForcedAdoption: true,
      authors: 'Marine Le Pen, Éric Ciotti et 104 députés'
    })
    expect(
      censureMotionOf(
        "la motion de censure, déposée en application de l'article 49, alinéa 2, de la Constitution, par M. Boris Vallaud et 65 députés."
      )
    ).toEqual({
      afterForcedAdoption: false,
      authors: 'Boris Vallaud et 65 députés'
    })
  })
})
