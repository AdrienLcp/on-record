import { describe, expect, it } from 'vitest'

import {
  declaredMonthOf,
  declaredTextOf,
  toInterestSections
} from '@/domain/hatvp/interests-summary.ts'
import {
  isDeclaredItemList,
  rawInterestsDeclarationSchema
} from '@/domain/hatvp/raw-interests-declaration.ts'
import { checkRaw } from '@/domain/raw-parsing.ts'
import { readXml } from '@/infrastructure/xml-reader.ts'

const NONE = '<items/><neant>true</neant>'

const section = (tag: string, content: string = NONE) =>
  `<${tag}>${content}</${tag}>`

/** A declaration where every section is « néant » except the ones given. */
const declarationXml = (sections: Record<string, string>) =>
  `<?xml version="1.0" encoding="UTF-8"?><declaration>${[
    'activConsultantDto',
    'activProfCinqDerniereDto',
    'activProfConjointDto',
    'fonctionBenevoleDto',
    'mandatElectifDto',
    'participationDirigeantDto',
    'participationFinanciereDto',
    'activCollaborateursDto',
    'observationInteretDto'
  ]
    .map((tag) => section(tag, sections[tag]))
    .join(
      ''
    )}<general><declarant><nom>dupont</nom><dateNaissance>12/05/1971</dateNaissance></declarant></general></declaration>`

const sectionsOf = (xml: string) => {
  const document = readXml({
    isList: isDeclaredItemList,
    path: 'test.xml',
    text: xml
  })
  if (document.status === 'failure') throw new Error('unreadable XML')
  const declaration = checkRaw(
    document.data,
    rawInterestsDeclarationSchema,
    'test.xml'
  )
  if (declaration.status === 'failure') throw new Error(declaration.error.code)
  return toInterestSections(declaration.data)
}

describe('toInterestSections', () => {
  it('[hatvp] says « néant » for every section declared empty', () => {
    const sections = sectionsOf(declarationXml({}))

    expect(Object.values(sections).map((entry) => entry.status)).toEqual(
      Array.from({ length: 9 }, () => 'none')
    )
  })

  it('[hatvp] reads a « néant » section that has no list at all', () => {
    const sections = sectionsOf(
      declarationXml({ observationInteretDto: '<neant>true</neant>' })
    )

    expect(sections.observations).toEqual({ status: 'none' })
  })

  it('[hatvp] reads a lone line as a list, in the declarant’s own words', () => {
    const sections = sectionsOf(
      declarationXml({
        participationDirigeantDto:
          '<items><items><motif><id>CREATION</id></motif><commentaire>[Données non publiées]</commentaire><conservee>true</conservee><nomSociete>association canuts solidarité</nomSociete><activite>fondateur  trésorier de l&apos;association</activite><remuneration><brutNet>Net</brutNet><montant><montant><annee>2018</annee><montant>0</montant></montant></montant></remuneration><dateDebut>12/2018</dateDebut><dateFin/></items></items><neant>false</neant>'
      })
    )

    expect(sections.governingBodies).toEqual({
      items: [
        {
          from: '2018-12',
          isKept: true,
          label: "fondateur trésorier de l'association",
          organisation: 'association canuts solidarité',
          to: null
        }
      ],
      status: 'listed'
    })
  })

  it('[hatvp] counts the spouse’s activities and the collaborators, never naming them', () => {
    const collaborator =
      '<items><nom>ROUQUET Hélène</nom><employeur>néant</employeur><descriptionActivite>fonctionnaire</descriptionActivite></items>'
    const sections = sectionsOf(
      declarationXml({
        activCollaborateursDto: `<items>${collaborator}${collaborator}</items><neant>false</neant>`,
        activProfConjointDto:
          '<items><items><nomConjoint>[Données non publiées]</nomConjoint><employeurConjoint>education nationale</employeurConjoint><activiteProf>PROFESSEUR</activiteProf></items></items><neant>false</neant>'
      })
    )

    expect(sections.collaborators).toEqual({ count: 2, status: 'listed' })
    expect(sections.spouseActivities).toEqual({ count: 1, status: 'listed' })
    expect(JSON.stringify(sections)).not.toContain('ROUQUET')
    expect(JSON.stringify(sections)).not.toContain('1971')
  })
})

describe('declaredTextOf', () => {
  it('[hatvp] drops the mark of withheld data and collapses spaces', () => {
    expect(declaredTextOf('\n   [Données non publiées]\n ')).toBeNull()
    expect(declaredTextOf(' conseillère   municipale\nPamiers ')).toBe(
      'conseillère municipale Pamiers'
    )
  })
})

describe('declaredMonthOf', () => {
  it('[hatvp] turns MM/yyyy into an ISO month and leaves anything else out', () => {
    expect(declaredMonthOf('03/2020')).toBe('2020-03')
    expect(declaredMonthOf('13/2020')).toBeNull()
    expect(declaredMonthOf('')).toBeNull()
  })
})
