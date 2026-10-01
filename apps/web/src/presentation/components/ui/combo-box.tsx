import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import { useRef } from 'react'
import {
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
  ComboBox as ReactAriaComboBox,
  type ComboBoxProps as ReactAriaComboBoxProps
} from 'react-aria-components'

import { Icon } from '@/presentation/components/icon'

import './field.sass'

export type ComboBoxProps<T extends object> = Omit<
  ReactAriaComboBoxProps<T>,
  'children'
> & {
  children: (item: T) => React.ReactNode
  label: string
  placeholder?: string
  /** What the open list says when nothing matches, or while it loads. */
  renderEmptyState: () => React.ReactNode
}

/**
 * A labelled search box that offers matches as one types. The caller filters
 * the `items`: the list never filters on its own.
 */
export const ComboBox = <T extends object>({
  children,
  className,
  items,
  label,
  placeholder,
  renderEmptyState,
  ...props
}: ComboBoxProps<T>) => {
  const fieldBox = useRef<HTMLDivElement>(null)

  return (
    <ReactAriaComboBox
      {...props}
      allowsEmptyCollection
      className={composeClassName(
        className,
        'field',
        'search-field',
        'combo-box'
      )}
      items={items}
      menuTrigger='input'
    >
      <Label className='field-label'>{label}</Label>
      <Group className='field-box' ref={fieldBox}>
        <Icon className='field-icon' name='search' />
        <Input className='field-input' placeholder={placeholder} />
      </Group>
      <Popover
        className='select-popover combo-box-popover'
        offset={4}
        triggerRef={fieldBox}
      >
        <ListBox className='select-list' renderEmptyState={renderEmptyState}>
          {children}
        </ListBox>
      </Popover>
    </ReactAriaComboBox>
  )
}

export const ComboBoxItem: React.FC<ListBoxItemProps> = ({
  className,
  ...props
}) => (
  <ListBoxItem
    {...props}
    className={composeClassName(className, 'select-item')}
  />
)
