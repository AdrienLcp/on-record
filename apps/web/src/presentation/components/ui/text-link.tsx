import { composeClassName } from '@adrienlcp/react-aria'
import type React from 'react'
import {
  Link as ReactAriaLink,
  type LinkProps as ReactAriaLinkProps
} from 'react-aria-components'

import { relForTarget } from '@/helpers/links'

import { NewTabMark } from './new-tab-mark'

import './text-link.sass'

export type TextLinkProps = Omit<ReactAriaLinkProps, 'children'> & {
  children: React.ReactNode
}

/** A link inside a sentence or a list: underlined, in the accent ink. */
export const TextLink: React.FC<TextLinkProps> = ({
  children,
  className,
  rel,
  target,
  ...props
}) => (
  <ReactAriaLink
    {...props}
    className={composeClassName(className, 'text-link')}
    rel={relForTarget({ rel, target })}
    target={target}
  >
    {children}
    {target === '_blank' && <NewTabMark />}
  </ReactAriaLink>
)
