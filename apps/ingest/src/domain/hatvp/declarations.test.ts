import { describe, expect, it } from 'vitest'

import {
  latestInterestsFile,
  toDeclarations
} from '@/domain/hatvp/declarations.ts'
import type { RawHatvpListRow } from '@/domain/hatvp/raw-hatvp-list.ts'

const row = (
  overrides: Partial<RawHatvpListRow> & Pick<RawHatvpListRow, 'type_document'>
): RawHatvpListRow => ({
  date_depot: '2024-08-04',
  date_publication: '2025-06-17',
  id_origine: '841729',
  nom: 'LAHMAR',
  nom_fichier: `lahmar-abdelkader-${overrides.type_document}1-depute-69.pdf`,
  open_data: null,
  prenom: 'Abdelkader',
  statut_publication: 'Livrée',
  type_mandat: 'depute',
  url_dossier: '/pages_nominatives/lahmar-abdelkader-27452',
  ...overrides
})

describe('toDeclarations', () => {
  it('[hatvp] never links an asset declaration, even one the list calls delivered', () => {
    const declarations = toDeclarations([
      row({ type_document: 'dsp' }),
      row({ date_depot: '2024-12-18', type_document: 'dspm' }),
      row({
        date_depot: null,
        statut_publication: 'En cours',
        type_document: 'dspfm'
      })
    ])

    expect(declarations.map((declaration) => declaration.pdfUrl)).toEqual([
      null,
      null,
      null
    ])
  })

  it('[hatvp] links a published declaration of interests, its accents percent-encoded', () => {
    expect(
      toDeclarations([
        row({
          nom_fichier: 'echaniz-iñaki-dia1-depute-64.pdf',
          type_document: 'dia'
        })
      ])
    ).toEqual([
      {
        filedOn: '2024-08-04',
        kind: 'interests',
        pdfUrl:
          'https://www.hatvp.fr/livraison/dossiers/echaniz-i%C3%B1aki-dia1-depute-64.pdf',
        publishedOn: '2025-06-17',
        status: 'published'
      }
    ])
  })

  it('[hatvp] lists undated declarations first, then the newest filed', () => {
    const declarations = toDeclarations([
      row({ type_document: 'dia' }),
      row({ date_depot: '2024-12-18', type_document: 'diam' }),
      row({
        date_depot: null,
        date_publication: null,
        nom_fichier: null,
        statut_publication: 'En cours',
        type_document: 'diam'
      })
    ])

    expect(
      declarations.map(({ filedOn, kind, status }) => ({
        filedOn,
        kind,
        status
      }))
    ).toEqual([
      { filedOn: null, kind: 'interestsUpdate', status: 'inProgress' },
      { filedOn: '2024-12-18', kind: 'interestsUpdate', status: 'published' },
      { filedOn: '2024-08-04', kind: 'interests', status: 'published' }
    ])
  })
})

describe('latestInterestsFile', () => {
  it('[hatvp] picks the latest published declaration of interests that has data', () => {
    expect(
      latestInterestsFile([
        row({ open_data: 'a-dia.xml', type_document: 'dia' }),
        row({
          date_depot: '2024-12-18',
          open_data: 'a-diam.xml',
          type_document: 'diam'
        }),
        row({
          date_depot: '2025-03-01',
          open_data: null,
          statut_publication: 'Déclaration déposée - publication à venir',
          type_document: 'diam'
        }),
        row({
          date_depot: '2026-01-01',
          open_data: 'a-dsp.xml',
          type_document: 'dsp'
        })
      ])
    ).toMatchObject({
      dataFileName: 'a-diam.xml',
      filedOn: '2024-12-18',
      kind: 'interestsUpdate'
    })
  })

  it('[hatvp] finds none while the only declaration is in progress', () => {
    expect(
      latestInterestsFile([
        row({
          date_depot: null,
          nom_fichier: null,
          statut_publication: 'En cours',
          type_document: 'dia'
        })
      ])
    ).toBeNull()
  })
})
