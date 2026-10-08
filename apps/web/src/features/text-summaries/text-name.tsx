import type React from 'react'

import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import type { ScrutinTitle } from '@/features/scrutins/scrutin-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { SummarisedFileId } from './summarised-text'

type TextNameProps = {
  summarisedFile: SummarisedFileId | null
  title: ScrutinTitle
}

/**
 * A text named by what it changes when on-record summarised it, by its
 * official subject otherwise: an official title often names the intention
 * a text claims, not what the deputies voted. A motion of censure keeps
 * its own name.
 */
export const TextName: React.FC<TextNameProps> = ({
  summarisedFile,
  title
}) => {
  const translate = useTranslate()

  return summarisedFile === null || title.kind !== 'text' ? (
    <ScrutinSubject title={title} />
  ) : (
    translate(`textSummaries.texts.${summarisedFile}.title`)
  )
}
