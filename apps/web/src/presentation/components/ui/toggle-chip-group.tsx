import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  ToggleButton as ReactAriaToggleButton,
  ToggleButtonGroup as ReactAriaToggleButtonGroup,
  type ToggleButtonGroupProps as ReactAriaToggleButtonGroupProps,
  type ToggleButtonProps
} from 'react-aria-components'

import './toggle-chip-group.sass'

export type ToggleChipGroupProps = Omit<
  ReactAriaToggleButtonGroupProps,
  'disallowEmptySelection' | 'selectionMode'
>

/**
 * Chips any number of which can be pressed, or none. Unlike the divider tabs,
 * nothing pressed is a state of its own: usually "no filter".
 */
export const ToggleChipGroup: React.FC<ToggleChipGroupProps> = ({
  className,
  ...props
}) => (
  <ReactAriaToggleButtonGroup
    {...props}
    className={composeClassName(className, 'toggle-chips')}
    selectionMode='multiple'
  />
)

export const ToggleChip: React.FC<ToggleButtonProps> = ({
  className,
  ...props
}) => (
  <ReactAriaToggleButton
    {...props}
    className={composeClassName(className, 'toggle-chip')}
  />
)
