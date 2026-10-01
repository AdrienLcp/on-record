import type React from 'react'
import { useState } from 'react'

import type { Commune } from '@/features/communes/commune'
import type { AddressMatch } from '@/infrastructure/base-adresse/base-adresse-client'
import { ComboBox, ComboBoxItem } from '@/presentation/components/ui/combo-box'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useAddressSearch } from './use-address-search'

type AddressFieldProps = {
  commune: Commune
  onSelect: (address: AddressMatch) => void
}

/** A street address inside the commune, suggested by the Base Adresse Nationale. */
export const AddressField: React.FC<AddressFieldProps> = ({
  commune,
  onSelect
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useState('')
  const [chosenLabel, setChosenLabel] = useState<string | null>(null)
  const search = useAddressSearch({
    communeCode: commune.code,
    query: query === chosenLabel ? '' : query
  })
  const matches = search.status === 'found' ? search.matches : []

  const emptyMessage = (): string => {
    switch (search.status) {
      case 'idle':
        return translate('findMyDeputy.address.typeMore')
      case 'searching':
        return translate('findMyDeputy.address.searching')
      case 'failed':
        return translate('findMyDeputy.address.failed')
      case 'found':
        return translate('findMyDeputy.address.noMatch')
    }
  }

  return (
    <ComboBox
      inputValue={query}
      items={matches}
      label={translate('findMyDeputy.address.label', { commune: commune.name })}
      onInputChange={setQuery}
      onSelectionChange={(key) => {
        const address = matches.find(({ id }) => id === key)

        if (address !== undefined) {
          setChosenLabel(address.label)
          setQuery(address.label)
          onSelect(address)
        }
      }}
      placeholder={translate('findMyDeputy.address.placeholder')}
      renderEmptyState={() => <p className='list-empty'>{emptyMessage()}</p>}
    >
      {(address) => (
        <ComboBoxItem id={address.id} textValue={address.label}>
          {address.label}
        </ComboBoxItem>
      )}
    </ComboBox>
  )
}
