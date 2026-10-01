import type React from 'react'
import { useState } from 'react'

import { ComboBox, ComboBoxItem } from '@/presentation/components/ui/combo-box'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { datasetErrorKey } from '@/presentation/i18n/translation'

import type { Commune } from './commune'
import { MIN_QUERY_LENGTH, searchCommunes } from './commune-search'
import { useCommunes } from './use-communes'

/** Enough to tell homonyms apart by their department, short enough to scan. */
const OFFERED_COMMUNES = 8

/** Beyond this, a commune's postcodes are summed up as a count. */
const LISTED_POSTCODES = 3

type CommuneFieldProps = {
  className?: string
  /** Shown in the box until the visitor types: the commune already chosen. */
  initialQuery?: string
  onSelect: (commune: Commune) => void
}

const PostcodesOf: React.FC<{ commune: Commune }> = ({ commune }) => {
  const translate = useTranslate()
  const listed = commune.postcodes.slice(0, LISTED_POSTCODES).join(', ')
  const others = commune.postcodes.length - LISTED_POSTCODES

  return (
    <span className='option-detail'>
      {others > 0
        ? translate('communes.postcodesAndMore', { count: others, listed })
        : listed}
      {' · '}
      {translate('communes.department', { code: commune.department })}
    </span>
  )
}

/**
 * Finds a commune by name or postcode, as one types. The commune index is
 * downloaded on the first keystroke or focus, not with the page.
 */
export const CommuneField: React.FC<CommuneFieldProps> = ({
  className,
  initialQuery = '',
  onSelect
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useState(initialQuery)
  const [isWanted, setIsWanted] = useState(false)
  const communes = useCommunes(isWanted)
  const matches =
    communes.status === 'ready'
      ? searchCommunes({
          communes: communes.communes,
          limit: OFFERED_COMMUNES,
          query
        })
      : []

  const emptyMessage = (): string => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      return translate('communes.typeMore')
    }

    switch (communes.status) {
      case 'failed':
        return translate(datasetErrorKey(communes.error))
      case 'ready':
        return translate('communes.noMatch')
      default:
        return translate('communes.loading')
    }
  }

  return (
    <ComboBox
      className={className}
      inputValue={query}
      items={matches}
      label={translate('communes.label')}
      onFocus={() => setIsWanted(true)}
      onInputChange={(value) => {
        setIsWanted(true)
        setQuery(value)
      }}
      onSelectionChange={(key) => {
        const commune = matches.find(({ code }) => code === key)

        if (commune !== undefined) {
          setQuery(commune.name)
          onSelect(commune)
        }
      }}
      placeholder={translate('communes.placeholder')}
      renderEmptyState={() => <p className='list-empty'>{emptyMessage()}</p>}
    >
      {(commune) => (
        <ComboBoxItem id={commune.code} textValue={commune.name}>
          <span className='option-name'>{commune.name}</span>
          <PostcodesOf commune={commune} />
        </ComboBoxItem>
      )}
    </ComboBox>
  )
}
