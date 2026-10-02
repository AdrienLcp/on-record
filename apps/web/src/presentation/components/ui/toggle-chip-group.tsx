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
> & {
  /**
   * `multiple` (default): any number pressed, or none, which is a state of
   * its own, usually "no filter". `single`: one answer among several, which
   * stays pressed once chosen.
   */
  selectionMode?: 'multiple' | 'single'
}

/** Chips standing for choices, unlike the divider tabs that file a list. */
export const ToggleChipGroup: React.FC<ToggleChipGroupProps> = ({
  className,
  selectionMode = 'multiple',
  ...props
}) => (
  <ReactAriaToggleButtonGroup
    {...props}
    className={composeClassName(className, 'toggle-chips')}
    disallowEmptySelection={selectionMode === 'single'}
    selectionMode={selectionMode}
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
