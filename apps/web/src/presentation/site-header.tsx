import type React from 'react'

import { paths, useCurrentPath } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { SkipLink } from '@/presentation/skip-link'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import './site-header.sass'

const SECTIONS = [
  { label: 'header.compare', path: paths.compare },
  {
    label: 'header.voteMatch',
    path: paths.home,
    shortLabel: 'header.voteMatchShort'
  },
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
  currentPath === sectionPath ||
  (sectionPath !== paths.home && currentPath.startsWith(`${sectionPath}/`))

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
          <span className='wordmark-text'>{translate('common.siteName')}</span>
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
                {'shortLabel' in section ? (
                  <>
                    <span className='site-nav-full'>
                      {translate(section.label)}
                    </span>
                    <span aria-hidden='true' className='site-nav-short'>
                      {translate(section.shortLabel)}
                    </span>
                  </>
                ) : (
                  translate(section.label)
                )}
              </Link>
            )
          })}
        </nav>
        <ThemeSwitch />
      </div>
    </header>
  )
}
