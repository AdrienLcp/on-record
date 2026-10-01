import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Button as ReactAriaButton,
  type ButtonProps as ReactAriaButtonProps
} from 'react-aria-components'

import './text-link.sass'
import './text-button.sass'

export type TextButtonProps = ReactAriaButtonProps

/** An action worded inside a sentence: it reads as a text link but changes the page instead of leaving it. */
export const TextButton: React.FC<TextButtonProps> = ({
  className,
  ...props
}) => (
  <ReactAriaButton
    {...props}
    className={composeClassName(className, 'text-link text-button')}
  />
)
