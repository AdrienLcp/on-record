import type React from 'react'

import type { Group } from '@on-record/protocol/assembly/group'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './group-label.sass'

type GroupLabelProps = {
  /** `null` for a vote cast while the deputy belonged to no known group. */
  group: Group | null
  /**
   * How much of the group's name shows (default: `'short'`):
   * - `'short'` — its acronym, the full name on hover and for screen readers
   * - `'full'` — its full name
   */
  length?: 'full' | 'short'
}

/**
 * A group's colour as an index tab before its name. The official colour is
 * data: a pale or dark one keeps an ink outline so it shows on both themes,
 * and a group without one is hatched rather than given an invented colour.
 */
export const GroupLabel: React.FC<GroupLabelProps> = ({
  group,
  length = 'short'
}) => {
  const translate = useTranslate()

  if (group === null) {
    return <span className='group-label'>{translate('deputy.noGroup')}</span>
  }

  return (
    <span className='group-label'>
      <span
        aria-hidden='true'
        className={group.color === null ? 'group-tab uncoloured' : 'group-tab'}
        style={
          group.color === null ? undefined : { '--group-color': group.color }
        }
      />
      {length === 'full' ? (
        group.name
      ) : (
        <abbr className='group-acronym' title={group.name}>
          {group.shortName}
        </abbr>
      )}
    </span>
  )
}
