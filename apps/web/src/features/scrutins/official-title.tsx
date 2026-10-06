import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ScrutinTitle } from './scrutin-title'

import './official-title.sass'

type OfficialTitleProps = {
  /** The title as the chamber words it, cited word for word. */
  official: string
  title: ScrutinTitle
}

/** The cited source under a scrutin's heading, after a hint of who tabled the text. */
export const OfficialTitle: React.FC<OfficialTitleProps> = ({
  official,
  title
}) => {
  const translate = useTranslate()

  return (
    <p className='official-title'>
      {title.kind === 'text' && (
        <span className='official-title-kind'>
          {translate(`scrutinTitle.textKindHint.${title.textKind}`)}.{' '}
        </span>
      )}
      {translate('scrutinTitle.officialTitle', { title: official })}
    </p>
  )
}
