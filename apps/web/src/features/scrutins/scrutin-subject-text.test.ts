import { describe, expect, it } from 'vitest'

import { translate } from '@/presentation/i18n/site-translator'

import { scrutinSubjectText } from './scrutin-subject-text'

describe('scrutinSubjectText', () => {
  it('names the special law, whose official title carries no subject', () => {
    expect(
      scrutinSubjectText({
        title: {
          isSecondDeliberation: false,
          kind: 'text',
          stage: null,
          subject: null,
          textKind: 'bill',
          votedPart: null
        },
        translate
      })
    ).toBe('Loi spéciale')
  })

  it('names a censure motion tabled after a forced adoption', () => {
    expect(
      scrutinSubjectText({
        title: { afterForcedAdoption: true, authors: 'X', kind: 'censure' },
        translate
      })
    ).toBe('Censurer le gouvernement après un 49.3')
  })

  it('names a censure motion tabled on its own', () => {
    expect(
      scrutinSubjectText({
        title: { afterForcedAdoption: false, authors: 'X', kind: 'censure' },
        translate
      })
    ).toBe('Censurer le gouvernement')
  })
})
