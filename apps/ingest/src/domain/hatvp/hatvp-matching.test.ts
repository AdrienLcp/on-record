import { describe, expect, it } from 'vitest'

import type { HatvpPerson } from '@/domain/hatvp/hatvp-list.ts'
import {
  type ChamberMember,
  matchHatvpPeople,
  nameKeyOf
} from '@/domain/hatvp/hatvp-matching.ts'

const person = (
  overrides: Partial<HatvpPerson> & Pick<HatvpPerson, 'pagePath'>
): HatvpPerson => ({
  chamber: 'assembly',
  firstName: 'Jean',
  lastName: 'DUPONT',
  originId: null,
  rows: [],
  ...overrides
})

const member = (
  overrides: Partial<ChamberMember> & Pick<ChamberMember, 'id'>
): ChamberMember => ({
  firstName: 'Jean',
  hatvpUrl: null,
  lastName: 'Dupont',
  originId: overrides.id.replace('PA', ''),
  ...overrides
})

describe('nameKeyOf', () => {
  it('[hatvp] ignores accents, case, the namesake suffix and the order of names', () => {
    expect(nameKeyOf('Marie-Hélène', 'MARTIN (GIRONDE)')).toBe(
      nameKeyOf('Hélène Marie', 'Martin')
    )
  })
})

describe('matchHatvpPeople', () => {
  it('[hatvp] matches on the id first, then the page number, then the name', () => {
    const byId = person({
      originId: '841729',
      pagePath: '/pages_nominatives/lahmar-abdelkader-27452'
    })
    const byPage = person({
      firstName: 'Antoine',
      lastName: 'VERMOREL-MARQUES',
      pagePath: '/pages_nominatives/vermorel-marques-antoine-30100'
    })
    const byName = person({
      firstName: 'Élisabeth',
      lastName: 'BORNE',
      pagePath: '/pages_nominatives/borne-elisabeth'
    })

    const { matches, report } = matchHatvpPeople({
      members: [
        member({ firstName: 'Abdelkader', id: 'PA841729', lastName: 'Lahmar' }),
        member({
          firstName: 'Antoine',
          hatvpUrl:
            'https://www.hatvp.fr/pages_nominatives/vermorel-marques-antoine-30100',
          id: 'PA2',
          lastName: 'Vermorel-Marquès'
        }),
        member({ firstName: 'Elisabeth', id: 'PA3', lastName: 'Borne' }),
        member({ firstName: 'Nobody', id: 'PA4', lastName: 'Known' })
      ],
      people: [byName, byPage, byId]
    })

    expect(matches.get('PA841729')).toBe(byId)
    expect(matches.get('PA2')).toBe(byPage)
    expect(matches.get('PA3')).toBe(byName)
    expect(matches.has('PA4')).toBe(false)
    expect(report).toEqual({
      name: 1,
      originId: 1,
      pageNumber: 1,
      unmatched: 1
    })
  })

  it('[hatvp] never guesses between two namesakes', () => {
    const { matches } = matchHatvpPeople({
      members: [member({ id: 'PA1' })],
      people: [
        person({ lastName: 'DUPONT (NORD)', pagePath: '/pages_nominatives/a' }),
        person({
          lastName: 'DUPONT (GIRONDE)',
          pagePath: '/pages_nominatives/b'
        })
      ]
    })

    expect(matches.size).toBe(0)
  })

  it('[hatvp] gives one person to one member only', () => {
    const { matches } = matchHatvpPeople({
      members: [member({ id: 'PA1' }), member({ id: 'PA2' })],
      people: [person({ originId: '1', pagePath: '/pages_nominatives/a' })]
    })

    expect([...matches.keys()]).toEqual(['PA1'])
  })
})
