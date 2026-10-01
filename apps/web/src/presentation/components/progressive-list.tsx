import type React from 'react'
import { useState } from 'react'

import { Button } from '@/presentation/components/ui/button'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './progressive-list.sass'

type ProgressiveListProps<T> = {
  className?: string
  items: readonly T[]
  keyOf: (item: T) => string | number
  /** How many lines show at first, and how many more each press adds. */
  pageSize: number
  renderItem: (item: T) => React.ReactNode
}

/**
 * A ruled list that shows its first lines and adds more on request, so a
 * deputy's thousands of votes never render at once. Give it a `key` that
 * changes with its filters: a new filter starts again from the top.
 */
export const ProgressiveList = <T,>({
  className,
  items,
  keyOf,
  pageSize,
  renderItem
}: ProgressiveListProps<T>) => {
  const translate = useTranslate()
  const [shownCount, setShownCount] = useState(pageSize)
  const shown = items.slice(0, shownCount)

  return (
    <div className='progressive-list'>
      <ol
        className={
          className === undefined ? 'ruled-list' : `ruled-list ${className}`
        }
      >
        {shown.map((item) => (
          <li key={keyOf(item)}>{renderItem(item)}</li>
        ))}
      </ol>
      {shown.length < items.length && (
        <div className='progressive-list-more'>
          <Button onPress={() => setShownCount((count) => count + pageSize)}>
            {translate('common.showMore')}
          </Button>
          <span className='progressive-list-count'>
            {translate('common.countOf', {
              shown: shown.length,
              total: items.length
            })}
          </span>
        </div>
      )}
    </div>
  )
}
