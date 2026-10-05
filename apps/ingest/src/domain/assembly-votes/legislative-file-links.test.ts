import { describe, expect, it } from 'vitest'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import {
  filesByScrutinNumber,
  withLegislativeFiles
} from '@/domain/assembly-votes/legislative-file-links.ts'
import { rawLegislativeFileSchema } from '@/domain/assembly-votes/raw-legislative-file.ts'

/** The Olympic Games 2030 bill as the zip writes it, trimmed to its decisions. */
const olympicGamesFile = {
  dossierParlementaire: {
    actesLegislatifs: {
      acteLegislatif: [
        {
          actesLegislatifs: {
            acteLegislatif: {
              actesLegislatifs: null,
              codeActe: 'AN1-DEBATS-DEC',
              voteRefs: { voteRef: 'VTANR5L17V4963' }
            }
          },
          codeActe: 'AN1'
        },
        {
          actesLegislatifs: {
            acteLegislatif: [
              {
                actesLegislatifs: null,
                codeActe: 'CMP-DEBATS-AN-DEC',
                voteRefs: { voteRef: 'VTANR5L17V5296' }
              },
              {
                actesLegislatifs: null,
                codeActe: 'CMP-DEBATS-SN-DEC',
                voteRefs: null
              }
            ]
          },
          codeActe: 'CMP'
        }
      ]
    },
    titreDossier: { titre: 'Jeux Olympiques et Paralympiques de 2030' },
    uid: 'DLR5L17N52100'
  }
}

const fileCiting = (uid: string, voteRef: string) => ({
  dossierParlementaire: {
    actesLegislatifs: {
      acteLegislatif: { actesLegislatifs: null, voteRefs: { voteRef } }
    },
    titreDossier: { titre: uid },
    uid
  }
})

const parsed = (file: unknown) =>
  rawLegislativeFileSchema.parse(file).dossierParlementaire

const scrutin = (
  number: number,
  legislativeFileId: string | null = null
): ScrutinDetail => ({
  corrections: [],
  date: '2026-01-13',
  groups: [],
  kind: 'solemn',
  legislativeFileId,
  number,
  outcome: 'adopted',
  requester: null,
  title: 'l’ensemble du projet de loi',
  totals: { abstention: 0, against: 0, for: 0, nonVoting: 0 }
})

describe('filesByScrutinNumber', () => {
  it('[nesting] finds the votes of every step, however deep', () => {
    const files = filesByScrutinNumber([parsed(olympicGamesFile)])

    expect([...files.keys()]).toEqual([4963, 5296])
  })

  it('[senate] leaves out the votes of the Senate', () => {
    const files = filesByScrutinNumber([
      parsed(fileCiting('DLR5L16N49726', 'VTSNR5L17V844'))
    ])

    expect(files.size).toBe(0)
  })
})

describe('withLegislativeFiles', () => {
  it('[link] gives a scrutin with no file the one file citing it', () => {
    const [linked] = withLegislativeFiles({
      files: [parsed(olympicGamesFile)],
      scrutins: [scrutin(4963)]
    })

    expect(linked?.legislativeFileId).toBe('DLR5L17N52100')
  })

  it('[own file] keeps the file a scrutin already names', () => {
    const [linked] = withLegislativeFiles({
      files: [parsed(olympicGamesFile)],
      scrutins: [scrutin(4963, 'DLR5L17N00001')]
    })

    expect(linked?.legislativeFileId).toBe('DLR5L17N00001')
  })

  it('[censure] links no file when two files cite the scrutin', () => {
    const [motion] = withLegislativeFiles({
      files: [
        parsed(fileCiting('DLR5L17N52428', 'VTANR5L17V5285')),
        parsed(fileCiting('DLR5L17N53689', 'VTANR5L17V5285'))
      ],
      scrutins: [scrutin(5285)]
    })

    expect(motion?.legislativeFileId).toBeNull()
  })
})
