import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ScrutinTitle } from './scrutin-title'

type ScrutinSubjectProps = {
  title: ScrutinTitle
}

/** What a scrutin was about, in the fewest words its official title allows. */
export const ScrutinSubject: React.FC<ScrutinSubjectProps> = ({ title }) => {
  const translate = useTranslate()

  if (title.kind !== 'censure') {
    return title.subject
  }

  return translate(
    title.afterForcedAdoption
      ? 'scrutinTitle.censure.afterForcedAdoption'
      : 'scrutinTitle.censure.plain'
  )
}
