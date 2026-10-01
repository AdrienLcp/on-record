import type React from 'react'

import { Icon } from '@/presentation/components/icon'
import { TextLink } from '@/presentation/components/ui/text-link'

import './back-link.sass'

type BackLinkProps = {
  children: React.ReactNode
  /** The list this record is filed in. */
  href: string
}

/** The way from a record back to the list it belongs to. */
export const BackLink: React.FC<BackLinkProps> = ({ children, href }) => (
  <TextLink className='back-link' href={href}>
    <Icon className='back-icon' name='arrowLeft' />
    {children}
  </TextLink>
)
