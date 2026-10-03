import { describe, expect, it } from 'vitest'

import {
  censureMotionOf,
  readingStageOf,
  scrutinTitleOf,
  subjectOf
} from './scrutin-title'

describe('scrutinTitleOf', () => {
  it('reads a whole text as its subject, its kind and its stage', () => {
    expect(
      scrutinTitleOf(
        "l'ensemble de la proposition de loi visant à moderniser la gestion du patrimoine immobilier de l'État (texte de la commission mixte paritaire)."
      )
    ).toEqual({
      isSecondDeliberation: false,
      kind: 'text',
      stage: 'jointCommittee',
      subject: "Moderniser la gestion du patrimoine immobilier de l'État",
      textKind: 'memberBill',
      votedPart: null
    })
  })

  it('keeps the amendment and the article an amendment vote was on', () => {
    expect(
      scrutinTitleOf(
        'l’amendement n° 374 de M. Bazin à l’article 9 du projet de loi de financement de la sécurité sociale pour 2025 (première lecture).'
      )
    ).toMatchObject({
      subject: 'Loi de financement de la sécurité sociale pour 2025',
      textKind: 'bill',
      votedPart: "Amendement n° 374 de M. Bazin à l'article 9"
    })
  })

  it('names the text a sub-amendment changes, not the amendment it amends', () => {
    expect(
      scrutinTitleOf(
        'le sous-amendement n° 97 de M. Cazenave à l’amendement n° 85 du Gouvernement à l’article 3 de la proposition de loi contre toutes les fraudes aux aides publiques (première lecture).'
      )
    ).toMatchObject({
      subject: 'Contre toutes les fraudes aux aides publiques',
      votedPart:
        "Sous-amendement n° 97 de M. Cazenave à l'amendement n° 85 du Gouvernement à l'article 3"
    })
  })

  it('drops the priority examination an article was given', () => {
    expect(
      scrutinTitleOf(
        "l'article 19 (examen prioritaire) du projet de loi d'urgence pour la protection et la souveraineté agricoles (première lecture)."
      )
    ).toMatchObject({
      subject: "Loi d'urgence pour la protection et la souveraineté agricoles",
      votedPart: 'Article 19'
    })
  })

  it('tells an organic or constitutional bill and a resolution apart', () => {
    expect(
      scrutinTitleOf(
        "l'ensemble du projet de loi organique relatif au renforcement des juridictions criminelles (première lecture)."
      )
    ).toMatchObject({
      subject: 'Renforcement des juridictions criminelles',
      textKind: 'organicBill'
    })
    expect(
      scrutinTitleOf(
        "l'ensemble du projet de loi constitutionnelle pour une Corse autonome au sein de la République (première lecture)."
      )
    ).toMatchObject({
      subject: 'Pour une Corse autonome au sein de la République',
      textKind: 'constitutionalBill'
    })
    expect(
      scrutinTitleOf(
        "l'article unique de la proposition de résolution européenne appelant au renforcement du soutien à l'Ukraine."
      )
    ).toMatchObject({
      stage: null,
      subject: "Renforcement du soutien à l'Ukraine",
      textKind: 'europeanResolution',
      votedPart: 'Article unique'
    })
  })

  it('keeps a whole resolution whole, without its constitutional basis', () => {
    expect(
      scrutinTitleOf(
        'la proposition de résolution visant à dénoncer les accords franco-algériens du 27 décembre 1968 (article 34-1 de la Constitution).'
      )
    ).toMatchObject({
      subject: 'Dénoncer les accords franco-algériens du 27 décembre 1968',
      textKind: 'resolution',
      votedPart: null
    })
  })

  it('files a second deliberation apart from the subject', () => {
    expect(
      scrutinTitleOf(
        "l'ensemble du projet de loi de financement de la sécurité sociale pour 2026(seconde délibération) (nouvelle lecture)."
      )
    ).toMatchObject({
      isSecondDeliberation: true,
      stage: 'newReading',
      subject: 'Loi de financement de la sécurité sociale pour 2026'
    })
  })

  it('names who moved to reject a text before it was examined', () => {
    expect(
      scrutinTitleOf(
        'la motion de rejet préalable, déposée par M. Boris Vallaud, de la proposition de loi visant à restaurer l’autorité de la justice à l’égard des mineurs délinquants et de leurs parents (première lecture).'
      )
    ).toMatchObject({
      subject:
        "Restaurer l'autorité de la justice à l'égard des mineurs délinquants et de leurs parents",
      votedPart: 'Motion de rejet préalable, déposée par M. Boris Vallaud'
    })
  })

  it('reads a motion of censure apart', () => {
    expect(
      scrutinTitleOf(
        "la motion de censure déposée en application de l'article 49, alinéa 3, de la Constitution par Mme Marine Le Pen, M. Éric Ciotti et 104 députés."
      )
    ).toEqual({
      afterForcedAdoption: true,
      authors: 'Marine Le Pen, Éric Ciotti et 104 députés',
      kind: 'censure'
    })
  })

  it('keeps a title that names no text, capitalised', () => {
    expect(
      scrutinTitleOf(
        "la déclaration du Gouvernement portant sur la stratégie de défense nationale (application de l'article 50-1 de la Constitution)."
      )
    ).toEqual({
      kind: 'other',
      subject:
        'Déclaration du Gouvernement portant sur la stratégie de défense nationale'
    })
  })
})

describe('subjectOf', () => {
  it('names a law by its genre when the title does', () => {
    expect(subjectOf('de finances pour 2026')).toBe('Loi de finances pour 2026')
    expect(subjectOf("d'urgence pour Mayotte")).toBe(
      "Loi d'urgence pour Mayotte"
    )
  })

  it('leaves the special law, whose title names no subject, to the interface', () => {
    expect(
      subjectOf(
        "spéciale prévue par l'article 45 de la loi organique du 1er août 2001 relative aux lois de finances"
      )
    ).toBeNull()
  })

  it('drops only the words that tie a text to its subject', () => {
    expect(subjectOf('relatif à la protection des enfants')).toBe(
      'Protection des enfants'
    )
    expect(subjectOf("relative au droit à l'aide à mourir")).toBe(
      "Droit à l'aide à mourir"
    )
    expect(
      subjectOf("visant à la nationalisation d'ArcelorMittal France")
    ).toBe("Nationalisation d'ArcelorMittal France")
    expect(subjectOf('portant création d’un statut de l’élu local')).toBe(
      'Création d’un statut de l’élu local'
    )
    expect(subjectOf('de simplification de la vie économique')).toBe(
      'Simplification de la vie économique'
    )
    expect(
      subjectOf('sur la justice criminelle et le respect des victimes')
    ).toBe('Justice criminelle et le respect des victimes')
  })

  it('drops the preposition a list repeats after the linking words', () => {
    expect(
      subjectOf(
        "relative à l'organisation, à la gestion et au financement du sport professionnel"
      )
    ).toBe('Organisation, gestion et financement du sport professionnel')
    expect(
      subjectOf(
        "visant à encourager, à faciliter et à sécuriser l'exercice du mandat d'élu local"
      )
    ).toBe(
      "Encourager, faciliter et sécuriser l'exercice du mandat d'élu local"
    )
    expect(
      subjectOf(
        'apportant une réponse intégrale au phénomène des violences sexuelles'
      )
    ).toBe('Réponse intégrale au phénomène des violences sexuelles')
  })

  it('keeps a verb that says what the text does, and a leading "pour"', () => {
    expect(subjectOf("créant l'homicide routier")).toBe(
      "Créant l'homicide routier"
    )
    expect(subjectOf('pour une montagne vivante et souveraine')).toBe(
      'Pour une montagne vivante et souveraine'
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
    expect(
      readingStageOf(
        "l'ensemble du projet de loi de finances pour 2026 (lecture définitive)."
      )
    ).toBe('finalReading')
  })

  it('has none for a vote outside the shuttle', () => {
    expect(
      readingStageOf(
        "l'article unique de la proposition de résolution européenne appelant au renforcement du soutien à l'Ukraine."
      )
    ).toBeNull()
  })
})

describe('censureMotionOf', () => {
  it('reads who tabled the motion, and whether it answers a 49.3', () => {
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
