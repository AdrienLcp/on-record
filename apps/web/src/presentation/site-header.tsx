import type React from 'react'

import { paths, useCurrentPath } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { SkipLink } from '@/presentation/skip-link'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import './site-header.sass'

const SECTIONS = [
  { label: 'header.deputies', path: paths.deputies },
  { label: 'header.scrutins', path: paths.scrutins },
  { label: 'header.groups', path: paths.groups }
] as const

/** A section stays current on the pages filed under it: a deputy, a scrutin. */
const isInSection = ({
  currentPath,
  sectionPath
}: {
  currentPath: string
  sectionPath: string
}): boolean =>
  currentPath === sectionPath || currentPath.startsWith(`${sectionPath}/`)

export const SiteHeader: React.FC = () => {
  const translate = useTranslate()
  const currentPath = useCurrentPath()

  return (
    <header className='site-header'>
      <SkipLink />
      <div className='site-header-row'>
        <Link
          aria-label={translate('header.home')}
          className='wordmark'
          href={paths.home}
        >
          <span aria-hidden='true' className='wordmark-card' />
          {translate('common.siteName')}
        </Link>
        <nav aria-label={translate('header.navigation')} className='site-nav'>
          {SECTIONS.map((section) => {
            const isCurrent = isInSection({
              currentPath,
              sectionPath: section.path
            })

            return (
              <Link
                aria-current={isCurrent ? 'page' : undefined}
                className='site-nav-link'
                href={section.path}
                key={section.path}
              >
                {translate(section.label)}
              </Link>
            )
          })}
        </nav>
        <ThemeSwitch />
      </div>
    </header>
  )
}
