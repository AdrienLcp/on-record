import { describe, expect, it } from 'vitest'

import {
  type LinkableAmendment,
  type LinkableScrutin,
  toScrutinLinks
} from '@/domain/assembly-amendments/scrutin-links.ts'

const SITTING = 'RUANR5L17S2025IDS28594'

const amendment = (
  overrides: Partial<LinkableAmendment> & { uid: string }
): LinkableAmendment => ({
  identicalDiscussionId: null,
  number: '2194',
  outcome: 'rejected',
  sittingId: SITTING,
  ...overrides
})

const scrutin: LinkableScrutin = {
  number: 3120,
  outcome: 'rejected',
  sittingId: SITTING,
  title: "l'amendement n° 2194 de M. Dupont à l'article 3 du projet de loi"
}

describe('toScrutinLinks', () => {
  it('[match] links the amendment the title cites in that sitting', () => {
    const links = toScrutinLinks({
      amendments: [
        amendment({ number: 'I-2194', uid: 'A' }),
        amendment({ sittingId: 'other', uid: 'B' })
      ],
      scrutins: [scrutin]
    })

    expect([...links]).toEqual([['A', 3120]])
  })

  it('[ambiguous] links nothing when two amendments answer', () => {
    const links = toScrutinLinks({
      amendments: [amendment({ uid: 'A' }), amendment({ uid: 'B' })],
      scrutins: [scrutin]
    })

    expect(links.size).toBe(0)
  })

  it('[outcome] links nothing when the outcomes disagree', () => {
    const links = toScrutinLinks({
      amendments: [amendment({ outcome: 'adopted', uid: 'A' })],
      scrutins: [scrutin]
    })

    expect(links.size).toBe(0)
  })

  it('[identical] spreads the link to the identical amendments of the sitting', () => {
    const links = toScrutinLinks({
      amendments: [
        amendment({ identicalDiscussionId: 'D1', uid: 'A' }),
        amendment({ identicalDiscussionId: 'D1', number: '2200', uid: 'B' }),
        amendment({
          identicalDiscussionId: 'D1',
          number: '2201',
          sittingId: 'other',
          uid: 'C'
        })
      ],
      scrutins: [scrutin]
    })

    expect([...links]).toEqual([
      ['A', 3120],
      ['B', 3120]
    ])
  })
})
