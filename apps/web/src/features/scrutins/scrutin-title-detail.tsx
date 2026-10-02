import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ScrutinTitle } from './scrutin-title'
import { TextKindTag } from './text-kind-tag'

import './scrutin-title-detail.sass'

type ScrutinTitleDetailProps = {
  title: ScrutinTitle
}

/**
 * What exactly was voted, under the subject: the kind of text, the part of it
 * (the whole text, an article, an amendment) and the stage; for a motion of
 * censure, who tabled it. Nothing for a title that names no text.
 */
export const ScrutinTitleDetail: React.FC<ScrutinTitleDetailProps> = ({
  title
}) => {
  const translate = useTranslate()

  if (title.kind === 'other') {
    return null
  }

  if (title.kind === 'censure') {
    return (
      <span className='scrutin-title-detail'>
        {translate('scrutinTitle.censure.tabledBy', {
          authors: title.authors
        })}
      </span>
    )
  }

  return (
    <span className='scrutin-title-detail'>
      <TextKindTag textKind={title.textKind} />
      <span className='scrutin-title-words'>
        <span className='scrutin-voted-part'>
          {title.votedPart ?? translate('scrutinTitle.wholeText')}
        </span>
        {title.isSecondDeliberation && (
          <span className='scrutin-title-qualifier'>
            {translate('scrutinTitle.secondDeliberation')}
          </span>
        )}
        {title.stage !== null && (
          <span className='scrutin-title-qualifier'>
            {translate(`scrutinTitle.stage.${title.stage}`)}
          </span>
        )}
      </span>
    </span>
  )
}
