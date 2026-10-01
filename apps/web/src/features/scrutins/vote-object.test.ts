import { describe, expect, it } from 'vitest'

import { voteObjectOf } from './vote-object'

describe('voteObjectOf', () => {
  it.each([
    [
      "l'amendement n° 1762 de M. Le Coq et l'amendement identique suivant à l'article 2 du projet de loi de finances pour 2025 (première lecture).",
      'amendment'
    ],
    [
      "le sous-amendement n° 48 de M. Tanguy à l'amendement n° 22 de M. de Courson à l'article 2 de la proposition de loi.",
      'amendment'
    ],
    [
      'l’amendement n° 1972 de M. Davi à l’article 15 (examen prioritaire) du projet de loi de simplification de la vie économique (première lecture).',
      'amendment'
    ],
    [
      "l'amenedement n° 187 de M. Renault à l'article 35 (examen prioritaire).",
      'amendment'
    ],
    [
      "l'article premier de la proposition de loi visant à renforcer la stabilité économique (première lecture).",
      'article'
    ],
    [
      "l'ensemble du projet de loi de finances pour 2025 (première lecture).",
      'wholeText'
    ],
    [
      "la proposition de résolution tendant à la création d'une commission d'enquête.",
      'wholeText'
    ],
    [
      'la première partie du projet de loi de finances pour 2026 (première lecture).',
      'textPart'
    ],
    [
      'la motion de rejet préalable, déposée par Mme Panot, sur le projet de loi.',
      'rejectionMotion'
    ],
    [
      'sur la motion de rejet préalable, déposée par Mme Mathilde Panot.',
      'rejectionMotion'
    ],
    [
      'la déclaration de politique générale du Gouvernement de M. François Bayrou.',
      'governmentDeclaration'
    ],
    [
      'la déclaration du Gouvernement portant sur la stratégie de défense.',
      'governmentDeclaration'
    ],
    [
      'la demande de suspension de séance formulée par M. Piquemal.',
      'procedural'
    ],
    [
      'la demande de seconde délibération de M. Jean-Philippe Tanguy sur l’amendement n° 2.',
      'procedural'
    ],
    ['un intitulé que rien ne permet de classer.', 'other']
  ])('[vote-object] reads %s as %s', (title, expected) => {
    expect(voteObjectOf({ kind: 'ordinary', title })).toBe(expected)
  })

  it('[vote-object] trusts the scrutin kind for a motion of censure', () => {
    expect(
      voteObjectOf({
        kind: 'censure',
        title:
          "la motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution."
      })
    ).toBe('censure')
  })
})
