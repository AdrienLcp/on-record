import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  ToggleButton as ReactAriaToggleButton,
  ToggleButtonGroup as ReactAriaToggleButtonGroup,
  type ToggleButtonGroupProps as ReactAriaToggleButtonGroupProps,
  type ToggleButtonProps
} from 'react-aria-components'

import './toggle-button-group.sass'

export type ToggleButtonGroupProps = ReactAriaToggleButtonGroupProps

/**
 * A row of divider tabs, like those standing out of a card index: one drawer
 * is always open. Single selection, never empty.
 */
export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  className,
  ...props
}) => (
  <ReactAriaToggleButtonGroup
    disallowEmptySelection
    selectionMode='single'
    {...props}
    className={composeClassName(className, 'divider-tabs')}
  />
)

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  className,
  ...props
}) => (
  <ReactAriaToggleButton
    {...props}
    className={composeClassName(className, 'divider-tab')}
  />
)
