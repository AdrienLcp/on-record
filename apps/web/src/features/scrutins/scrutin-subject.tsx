import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { scrutinSubjectText } from './scrutin-subject-text'
import type { ScrutinTitle } from './scrutin-title'

type ScrutinSubjectProps = {
  title: ScrutinTitle
}

/** What a scrutin was about, in the fewest words its official title allows. */
export const ScrutinSubject: React.FC<ScrutinSubjectProps> = ({ title }) => {
  const translate = useTranslate()

  return scrutinSubjectText({ title, translate })
}
