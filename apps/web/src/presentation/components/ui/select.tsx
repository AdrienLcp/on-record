import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
  Select as ReactAriaSelect,
  type SelectProps as ReactAriaSelectProps,
  SelectValue
} from 'react-aria-components'

import { Icon } from '@/presentation/components/icon'

import './field.sass'

export type SelectProps = Omit<
  ReactAriaSelectProps<object, 'single'>,
  'children'
> & {
  children: React.ReactNode
  label: string
}

/** A labelled single choice in a list that opens below its button. */
export const Select: React.FC<SelectProps> = ({
  children,
  className,
  label,
  ...props
}) => (
  <ReactAriaSelect
    {...props}
    className={composeClassName(className, 'field', 'select')}
  >
    <Label className='field-label'>{label}</Label>
    <Button className='field-box select-button'>
      <SelectValue className='select-value' />
      <Icon className='field-icon' name='chevronDown' />
    </Button>
    <Popover className='select-popover'>
      <ListBox className='select-list'>{children}</ListBox>
    </Popover>
  </ReactAriaSelect>
)

export const SelectItem: React.FC<ListBoxItemProps> = ({
  className,
  ...props
}) => (
  <ListBoxItem
    {...props}
    className={composeClassName(className, 'select-item')}
  />
)
