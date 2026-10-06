import { describe, expect, it } from 'vitest'

import { readHatvpList } from '@/domain/hatvp/hatvp-list.ts'

const HEADER =
  'civilite;prenom;nom;classement;type_mandat;qualite;type_document;departement;date_publication;date_depot;nom_fichier;url_dossier;open_data;statut_publication;id_origine;url_photo'

const listOf = (...rows: string[]): string =>
  `${[HEADER, ...rows].join('\r\n')}\r\n`

describe('readHatvpList', () => {
  it('[hatvp] groups the rows of one seat under one person and leaves other mandates out', () => {
    const people = readHatvpList(
      listOf(
        'M.;Abdelkader;LAHMAR;x;depute;Député du Rhône;dia;69;2025-06-17;2024-08-04;lahmar-abdelkader-dia31320-depute-69.pdf;/pages_nominatives/lahmar-abdelkader-27452;lahmar-abdelkader-dia31320-depute-69.xml;Livrée;841729;',
        'M.;Abdelkader;LAHMAR;x;depute;Député du Rhône;dsp;69;2025-06-23;2024-08-04;lahmar-abdelkader-dsp31970-depute-69.pdf;/pages_nominatives/lahmar-abdelkader-27452;;Livrée;841729;',
        'M.;Abdel Kader;CHEKHEMANI;x;commune;Adjoint au maire de Rouen;di;76;;2026-05-24;;/pages_nominatives/chekhemani-abdel-kader;;Déclaration déposée - publication à venir;;',
        'Mme;Agnès;CANAYER;x;senateur;Sénatrice de Seine-Maritime;dia;76;;;;/pages_nominatives/canayer-agnes;;En cours;14053L;'
      ),
      'liste.csv'
    )

    expect(people.status).toBe('success')
    if (people.status !== 'success') return
    expect(
      people.data.map((person) => ({
        chamber: person.chamber,
        originId: person.originId,
        pagePath: person.pagePath,
        rows: person.rows.map((row) => row.type_document)
      }))
    ).toEqual([
      {
        chamber: 'assembly',
        originId: '841729',
        pagePath: '/pages_nominatives/lahmar-abdelkader-27452',
        rows: ['dia', 'dsp']
      },
      {
        chamber: 'senate',
        originId: '14053L',
        pagePath: '/pages_nominatives/canayer-agnes',
        rows: ['dia']
      }
    ])
    expect(people.data[1]?.rows[0]).toMatchObject({
      date_depot: null,
      nom_fichier: null,
      open_data: null,
      statut_publication: 'En cours'
    })
  })

  it('[hatvp] refuses a file name that would leave the cache folder', () => {
    expect(
      readHatvpList(
        listOf(
          'M.;Jean;DUPONT;x;depute;Député;dia;01;2025-01-02;2025-01-01;../evil.pdf;/pages_nominatives/dupont-jean-1;dupont.xml;Livrée;1;'
        ),
        'liste.csv'
      ).status
    ).toBe('failure')
  })
})
