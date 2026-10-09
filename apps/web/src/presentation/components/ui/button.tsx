import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button as ReactAriaButton,
  type ButtonProps as ReactAriaButtonProps
} from 'react-aria-components'

import './button.sass'

export type ButtonProps = ReactAriaButtonProps &
  React.RefAttributes<HTMLButtonElement>

/** A plain ruled button: the site has few actions, and none shouts. */
export const Button: React.FC<ButtonProps> = ({ className, ...props }) => (
  <ReactAriaButton
    {...props}
    className={composeClassName(className, 'button')}
  />
)
