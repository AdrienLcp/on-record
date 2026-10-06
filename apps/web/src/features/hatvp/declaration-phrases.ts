import {
  type Declaration,
  isAssetDeclaration
} from '@on-record/protocol/hatvp/hatvp-record'

import type { IsoDay } from '@/helpers/iso-day'

/** One phrase of a declaration's state line, keyed in `hatvp.declarations.phrases`. */
export type DeclarationPhrase =
  | { day: IsoDay; key: 'filed' | 'published' }
  | {
      key:
        | 'awaiting'
        | 'exempt'
        | 'inProgress'
        | 'notFiled'
        | 'prefecture'
        | 'prefectureSoon'
    }

const statusPhraseOf = ({
  kind,
  publishedOn,
  status
}: Declaration): DeclarationPhrase | null => {
  const isAssets = isAssetDeclaration(kind)
  switch (status) {
    case 'published':
      if (isAssets) return { key: 'prefecture' }
      return publishedOn === null
        ? null
        : { day: publishedOn, key: 'published' }
    case 'awaitingPublication':
      return { key: isAssets ? 'prefectureSoon' : 'awaiting' }
    case 'inProgress':
      return { key: 'inProgress' }
    case 'notFiled':
      return { key: 'notFiled' }
    case 'exempt':
      return { key: 'exempt' }
  }
}

/**
 * Where a declaration stands, as phrases joined on one line: when it was
 * filed, then whether it can be read — online, or in the prefecture for an
 * asset declaration, which is never published.
 */
export const declarationPhrasesOf = (
  declaration: Declaration
): DeclarationPhrase[] => {
  const statusPhrase = statusPhraseOf(declaration)
  return [
    ...(declaration.filedOn === null
      ? []
      : [{ day: declaration.filedOn, key: 'filed' } as const]),
    ...(statusPhrase === null ? [] : [statusPhrase])
  ]
}

/** The document to read online; never one for an asset declaration, whatever the data says. */
export const readableUrlOf = (declaration: Declaration): string | null =>
  isAssetDeclaration(declaration.kind) ? null : declaration.pdfUrl
