import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './loading-lines.sass'

type LoadingLinesProps = {
  /** How many ruled lines stand in for the content (default: `4`). */
  lines?: number
}

/** Empty ruled lines where a record is still arriving: the layout does not jump. */
export const LoadingLines: React.FC<LoadingLinesProps> = ({ lines = 4 }) => {
  const translate = useTranslate()

  return (
    <div aria-busy='true' className='loading-lines'>
      <span className='loading-label'>{translate('common.loading')}</span>
      <span className='loading-sheet' style={{ '--lines': lines }} />
    </div>
  )
}
