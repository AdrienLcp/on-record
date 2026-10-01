import type React from 'react'

import './app-shell.sass'

type AppShellProps = {
  children: React.ReactNode
  /**
   * Left out by the error screen, which must not depend on chrome that may be
   * what broke.
   */
  footer?: React.ReactNode
  header?: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  footer,
  header
}) => (
  <div className='app-shell'>
    {header}
    {children}
    {footer}
  </div>
)
