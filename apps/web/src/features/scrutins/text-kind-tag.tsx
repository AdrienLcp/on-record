import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { TextKind } from './scrutin-title'

import './text-kind-tag.sass'

type TextKindTagProps = {
  textKind: TextKind
}

/** The kind of text a vote was on, as a small label beside its subject. */
export const TextKindTag: React.FC<TextKindTagProps> = ({ textKind }) => {
  const translate = useTranslate()

  return (
    <span className='text-kind-tag'>
      {translate(`scrutinTitle.textKind.${textKind}`)}
    </span>
  )
}
