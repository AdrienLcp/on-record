import { describe, expect, it } from 'vitest'

import { toSenateCorrections } from '@/domain/senate-votes/senate-corrections.ts'

const GROUPED_SENTENCE =
  "Lors de la séance du mardi 6 février 2024, MM. Jean-Pierre Bansard, Mathieu Darnaud, Mme Évelyne Renaud-Garabedian et M. Jean Pierre Vogel ont fait savoir qu'ils auraient souhaité voter pour."

describe('toSenateCorrections', () => {
  it('[senate] reads the intended position of each senator a sentence names', () => {
    expect(
      toSenateCorrections({
        flaggedSenators: [
          { fullName: 'Mathieu Darnaud', groupName: null, senatorId: '14001X' },
          {
            fullName: 'Évelyne Renaud-Garabedian',
            groupName: null,
            senatorId: '14002Y'
          }
        ],
        sentences: [
          GROUPED_SENTENCE,
          "Lors de la séance du vendredi 1 décembre 2023, M. Jean-Marie Vanlerenberghe a fait savoir qu'il aurait souhaité s'abstenir."
        ]
      })
    ).toEqual({
      corrections: [
        { intended: 'for', senatorId: '14001X' },
        { intended: 'for', senatorId: '14002Y' }
      ],
      unmatched: []
    })
  })

  it('[senate] matches a name whatever its hyphens and accents', () => {
    expect(
      toSenateCorrections({
        flaggedSenators: [
          {
            fullName: 'Jean-Pierre Vogel',
            groupName: null,
            senatorId: '14003Z'
          }
        ],
        sentences: [GROUPED_SENTENCE]
      }).corrections
    ).toEqual([{ intended: 'for', senatorId: '14003Z' }])
  })

  it('[senate] reads every wording of an intended position', () => {
    const intendedFor = (wording: string) =>
      toSenateCorrections({
        flaggedSenators: [
          { fullName: 'Audrey Bélim', groupName: null, senatorId: '14004A' }
        ],
        sentences: [
          `Mme Audrey Bélim a fait savoir qu'elle aurait souhaité ${wording}.`
        ]
      }).corrections[0]?.intended

    expect(intendedFor('voter contre')).toBe('against')
    expect(intendedFor("s'abstenir")).toBe('abstention')
    expect(intendedFor('ne pas prendre part au vote')).toBe('nonVoting')
  })

  it('[senate] reads a sentence speaking for the whole group of the senator', () => {
    expect(
      toSenateCorrections({
        flaggedSenators: [
          {
            fullName: 'Rémi Cardon',
            groupName: 'Groupe Socialiste, Écologiste et Républicain',
            senatorId: '14006C'
          },
          {
            fullName: 'Marc Laménie',
            groupName: 'Groupe Les Républicains',
            senatorId: '14007D'
          }
        ],
        sentences: [
          "Lors de la séance du mercredi 23 octobre 2024, les membres du groupe Socialiste, Écologiste et Républicain ont fait savoir qu'ils auraient souhaité voter contre."
        ]
      })
    ).toEqual({
      corrections: [{ intended: 'against', senatorId: '14006C' }],
      unmatched: ['14007D']
    })
  })

  it('[senate] leaves out a flagged senator no sentence names', () => {
    expect(
      toSenateCorrections({
        flaggedSenators: [
          { fullName: 'Pierre Darnaud', groupName: null, senatorId: '14005B' }
        ],
        sentences: [GROUPED_SENTENCE]
      })
    ).toEqual({ corrections: [], unmatched: ['14005B'] })
  })
})
