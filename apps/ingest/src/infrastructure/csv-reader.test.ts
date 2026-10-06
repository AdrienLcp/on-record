import { describe, expect, it } from 'vitest'

import { parseCsv, recordsOf } from '@/domain/constituencies/csv-rows.ts'

describe('parseCsv', () => {
  it('[csv] reads quoted fields, a quote inside one and CRLF line ends', () => {
    expect(
      parseCsv(
        '"COM","LIBELLE"\r\n"01001","L\'Abergement ""haut"", Ain"\r\n',
        ','
      )
    ).toEqual([
      ['COM', 'LIBELLE'],
      ['01001', 'L\'Abergement "haut", Ain']
    ])
  })

  it('[csv] keeps empty fields and skips blank lines', () => {
    expect(
      parseCsv('01001;L ABERGEMENT;01400;;\n\n01002;X;01640;Y;\n', ';')
    ).toEqual([
      ['01001', 'L ABERGEMENT', '01400', '', ''],
      ['01002', 'X', '01640', 'Y', '']
    ])
  })
})

describe('recordsOf', () => {
  it('[csv] keys each row by the header', () => {
    expect(
      recordsOf([
        ['COM', 'DEP'],
        ['2A004', '2A']
      ])
    ).toEqual([{ COM: '2A004', DEP: '2A' }])
  })
})
