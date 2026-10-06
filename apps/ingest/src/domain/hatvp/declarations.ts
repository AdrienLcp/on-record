import type {
  Declaration,
  DeclarationKind,
  DeclarationStatus
} from '@on-record/protocol/hatvp/hatvp-record.ts'
import { isAssetDeclaration } from '@on-record/protocol/hatvp/hatvp-record.ts'

import { declarationFileUrl } from '@/domain/hatvp/hatvp-sources.ts'
import type { RawHatvpListRow } from '@/domain/hatvp/raw-hatvp-list.ts'

/** The list's `type_document` codes of a parliamentarian's declarations. */
const KIND_BY_DOCUMENT_TYPE: Readonly<Record<string, DeclarationKind>> = {
  dia: 'interests',
  diam: 'interestsUpdate',
  dsp: 'assets',
  dspfm: 'assetsEndOfMandate',
  dspm: 'assetsUpdate'
}

const STATUS_BY_LABEL = {
  'Déclaration déposée - publication en préfecture à venir':
    'awaitingPublication',
  'Déclaration déposée - publication à venir': 'awaitingPublication',
  'Déclaration non déposée': 'notFiled',
  dispense: 'exempt',
  'En cours': 'inProgress',
  Livrée: 'published'
} as const satisfies Record<
  RawHatvpListRow['statut_publication'],
  DeclarationStatus
>

const KIND_ORDER: readonly DeclarationKind[] = [
  'interestsUpdate',
  'interests',
  'assetsEndOfMandate',
  'assetsUpdate',
  'assets'
]

const kindOf = (row: RawHatvpListRow): DeclarationKind | null =>
  KIND_BY_DOCUMENT_TYPE[row.type_document] ?? null

/** Undated first (still in progress), then newest filed first. */
const newestFirst = (left: Declaration, right: Declaration): number => {
  if (left.filedOn !== right.filedOn) {
    if (left.filedOn === null) return -1
    if (right.filedOn === null) return 1
    return right.filedOn.localeCompare(left.filedOn)
  }
  return KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind)
}

/**
 * The person's declarations as the list states them. Only a published
 * declaration of interests is linked: an asset declaration never is.
 */
export const toDeclarations = (
  rows: readonly RawHatvpListRow[]
): Declaration[] =>
  rows
    .flatMap((row): Declaration[] => {
      const kind = kindOf(row)
      if (kind === null) return []
      const status = STATUS_BY_LABEL[row.statut_publication]
      const isLinked = !isAssetDeclaration(kind) && status === 'published'
      return [
        {
          filedOn: row.date_depot,
          kind,
          pdfUrl:
            isLinked && row.nom_fichier !== null
              ? declarationFileUrl(row.nom_fichier)
              : null,
          publishedOn: row.date_publication,
          status
        }
      ]
    })
    .toSorted(newestFirst)

/** A declaration of interests published as data: the one to summarise. */
export type InterestsFile = {
  filedOn: string
  kind: 'interests' | 'interestsUpdate'
  /** The XML's file name, from `open_data`. */
  dataFileName: string
  pdfUrl: string
}

/**
 * The latest declaration of interests published as data. An update restates
 * the whole declaration, so the latest filed is the current one.
 */
export const latestInterestsFile = (
  rows: readonly RawHatvpListRow[]
): InterestsFile | null => {
  const files = rows.flatMap((row): InterestsFile[] => {
    const kind = kindOf(row)
    if (
      (kind !== 'interests' && kind !== 'interestsUpdate') ||
      row.statut_publication !== 'Livrée' ||
      row.open_data === null ||
      row.nom_fichier === null ||
      row.date_depot === null
    ) {
      return []
    }
    return [
      {
        dataFileName: row.open_data,
        filedOn: row.date_depot,
        kind,
        pdfUrl: declarationFileUrl(row.nom_fichier)
      }
    ]
  })
  return (
    files.toSorted(
      (left, right) =>
        right.filedOn.localeCompare(left.filedOn) ||
        KIND_ORDER.indexOf(left.kind) - KIND_ORDER.indexOf(right.kind)
    )[0] ?? null
  )
}
