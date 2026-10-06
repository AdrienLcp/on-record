import { describe, expect, it } from 'vitest'

import { readCsvRecords } from '@/infrastructure/csv-reader.ts'

describe('readCsvRecords', () => {
  it('[csv] reads quoted fields, a quote inside one and CRLF line ends', () => {
    expect(
      readCsvRecords({
        path: 'communes',
        separator: ',',
        text: '"COM","LIBELLE"\r\n"01001","L\'Abergement ""haut"", Ain"\r\n'
      })
    ).toEqual({
      data: [{ COM: '01001', LIBELLE: 'L\'Abergement "haut", Ain' }],
      status: 'success'
    })
  })

  it('[csv] keeps empty fields and skips blank lines', () => {
    expect(
      readCsvRecords({
        path: 'postcodes',
        separator: ';',
        text: 'COM;LIBELLE;CP;LIGNE;\n01001;L ABERGEMENT;01400;;\n\n;;;;\n01002;X;01640;Y;\n'
      })
    ).toEqual({
      data: [
        {
          '': '',
          COM: '01001',
          CP: '01400',
          LIBELLE: 'L ABERGEMENT',
          LIGNE: ''
        },
        { '': '', COM: '01002', CP: '01640', LIBELLE: 'X', LIGNE: 'Y' }
      ],
      status: 'success'
    })
  })

  it('[csv] fails on a quote left open', () => {
    expect(
      readCsvRecords({ path: 'communes', separator: ',', text: 'A,B\n"1,2\n' })
        .status
    ).toBe('failure')
  })
})
