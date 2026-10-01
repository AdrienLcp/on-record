import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button,
  Input,
  Label,
  SearchField as ReactAriaSearchField,
  type SearchFieldProps as ReactAriaSearchFieldProps
} from 'react-aria-components'

import { Icon } from '@/presentation/components/icon'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './field.sass'

export type SearchFieldProps = ReactAriaSearchFieldProps & {
  label: string
  placeholder?: string
}

/** A labelled search box with its clear button; Escape clears it too. */
export const SearchField: React.FC<SearchFieldProps> = ({
  className,
  label,
  placeholder,
  ...props
}) => {
  const translate = useTranslate()

  return (
    <ReactAriaSearchField
      {...props}
      className={composeClassName(className, 'field', 'search-field')}
    >
      <Label className='field-label'>{label}</Label>
      <div className='field-box'>
        <Icon className='field-icon' name='search' />
        <Input className='field-input' placeholder={placeholder} />
        <Button
          aria-label={translate('ui.clearSearch')}
          className='field-clear'
        >
          <Icon name='clear' />
        </Button>
      </div>
    </ReactAriaSearchField>
  )
}
