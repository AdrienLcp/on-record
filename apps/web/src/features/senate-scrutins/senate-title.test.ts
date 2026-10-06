import { describe, expect, it } from 'vitest'

import {
  assemblyWordingOf,
  senateScrutinTitleOf,
  senateVoteObjectOf
} from './senate-title'

const ordinary = (title: string) =>
  senateVoteObjectOf({ kind: 'ordinary', title })

describe('assemblyWordingOf', () => {
  it('drops who tabled an amendment and the comma before what it changes', () => {
    expect(
      assemblyWordingOf(
        "sur l’amendement n° 441 rectifié, présenté par le Gouvernement, à l'article 8 du projet de loi portant simplification des normes"
      )
    ).toBe(
      "l'amendement n° 441 rectifié à l'article 8 du projet de loi portant simplification des normes"
    )
  })

  it('keeps every number of identical amendments, without their authors', () => {
    expect(
      assemblyWordingOf(
        "sur les amendements identiques n° 154 rectifié, présenté par M. Bernard Delcros et plusieurs de ses collègues, n° 207 rectifié bis, présenté par M. Yves Bleunven et plusieurs de ses collègues, et n° 410, présenté par le Gouvernement, à l'article 2 du projet de loi visant la relance du logement"
      )
    ).toBe(
      "les amendements identiques n° 154 rectifié, n° 207 rectifié bis et n° 410 à l'article 2 du projet de loi visant la relance du logement"
    )
  })

  it('reads a group name with a comma inside as part of who tabled it', () => {
    expect(
      assemblyWordingOf(
        'sur l’amendement n° 1, présenté par Mme Raymonde Poncet Monge et les membres du groupe Socialiste, Écologiste et Républicain, tendant à supprimer l’article unique du projet de loi portant transposition'
      )
    ).toBe(
      "l'amendement n° 1 tendant à supprimer l'article unique du projet de loi portant transposition"
    )
  })

  it('words a joint committee text as the Assemblée does', () => {
    expect(
      assemblyWordingOf(
        "sur l'ensemble du texte élaboré par la commission mixte paritaire sur la proposition de loi visant à renforcer la sécurité"
      )
    ).toBe(
      "l'ensemble de la proposition de loi visant à renforcer la sécurité (texte de la commission mixte paritaire)"
    )
  })

  it('reads a single article that makes the whole text as the whole text', () => {
    expect(
      assemblyWordingOf(
        "sur l'article unique constituant l'ensemble de la proposition de loi visant à assouplir la procédure"
      )
    ).toBe(
      "l'ensemble de la proposition de loi visant à assouplir la procédure"
    )
  })
})

describe('senateVoteObjectOf', () => {
  it('reads the question préalable and the exception as motions to reject', () => {
    expect(
      ordinary(
        'sur la motion n° 2, présentée par Mme Christine Bonfanti-Dossat au nom de la commission des affaires sociales, tendant à opposer la question préalable à la proposition de loi relative au droit à l’aide à mourir (nouvelle lecture)'
      )
    ).toBe('rejectionMotion')
    expect(
      ordinary(
        "sur la motion n° 1, présentée par Mme Cathy Apourceau-Poly et les membres du groupe Communiste Républicain Citoyen et Écologiste - Kanaky, tendant à opposer l'exception d'irrecevabilité au projet de loi de sécurisation du travail"
      )
    ).toBe('rejectionMotion')
  })

  it('reads a referral to committee apart from a rejection', () => {
    expect(
      ordinary(
        'sur la motion n° 57, présentée par Mme Marianne Margaté et les membres du groupe CRCE - Kanaky, tendant au renvoi en commission du projet de loi visant la relance du logement'
      )
    ).toBe('referralMotion')
  })

  it('reads the credits of a budget mission apart from a part of the text', () => {
    expect(
      ordinary(
        "sur les crédits de la mission « Sport, jeunesse et vie associative » figurant à l'état B du projet de loi de finances pour 2026"
      )
    ).toBe('budgetCredits')
  })

  it('reads an amendment on budget credits as an amendment', () => {
    expect(
      ordinary(
        "sur le sous-amendement n° II-2343, présenté par M. Claude Raynal et plusieurs de ses collègues, à l'amendement n° II-19, présenté par M. Jean-François Husson au nom de la commission des finances, sur les crédits de la mission « Investir pour la France de 2030 » figurant à l'état B du projet de loi de finances pour 2026"
      )
    ).toBe('amendment')
  })
})

describe('senateScrutinTitleOf', () => {
  it('names the subject, the part voted and the stage', () => {
    expect(
      senateScrutinTitleOf(
        "sur l'amendement n° 348 rectifié, présenté par M. Jean Sol et plusieurs de ses collègues, à l'article 2 de la proposition de loi relative au droit à l'aide à mourir (deuxième lecture)"
      )
    ).toEqual({
      isSecondDeliberation: false,
      kind: 'text',
      stage: 'secondReading',
      subject: "Droit à l'aide à mourir",
      textKind: 'memberBill',
      votedPart: "Amendement n° 348 rectifié à l'article 2"
    })
  })

  it('names a motion by its number and what it opposes', () => {
    expect(
      senateScrutinTitleOf(
        'sur la motion n° 3, présentée par Mme Raymonde Poncet Monge et les membres du groupe Écologiste - Solidarité et Territoires, tendant à opposer la question préalable au projet de loi de sécurisation du travail'
      )
    ).toMatchObject({
      textKind: 'bill',
      votedPart: 'Motion de rejet n° 3 (question préalable)'
    })
  })

  it('reads a framework bill as a bill', () => {
    expect(
      senateScrutinTitleOf(
        "sur l'ensemble du projet de loi-cadre relatif au développement des transports"
      )
    ).toMatchObject({
      subject: 'Développement des transports',
      textKind: 'bill',
      votedPart: null
    })
  })
})
