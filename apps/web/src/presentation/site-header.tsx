import type React from 'react'
import { useEffect, useId, useRef, useState } from 'react'

import { paths, useCurrentPath } from '@/infrastructure/router/navigation'
import { Icon } from '@/presentation/components/icon'
import { Button } from '@/presentation/components/ui/button'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { SkipLink } from '@/presentation/skip-link'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import './site-header.sass'

const SECTIONS = [
  { label: 'header.compare', path: paths.compare },
  {
    label: 'header.voteMatch',
    path: paths.voteMatch,
    shortLabel: 'header.voteMatchShort'
  },
  { label: 'header.deputies', path: paths.deputies },
  { label: 'header.scrutins', path: paths.scrutins },
  { label: 'header.groups', path: paths.groups },
  {
    label: 'header.senate',
    path: paths.senators,
    within: ['/senat/']
  }
] as const

/**
 * A section stays current on the pages filed under it: a deputy, a scrutin,
 * and for the Senate its scrutins too.
 */
const isInSection = ({
  currentPath,
  section
}: {
  currentPath: string
  section: (typeof SECTIONS)[number]
}): boolean =>
  currentPath === section.path ||
  (section.path !== paths.compare &&
    currentPath.startsWith(`${section.path}/`)) ||
  ('within' in section &&
    section.within.some((prefix) => currentPath.startsWith(prefix)))

export const SiteHeader: React.FC = () => {
  const translate = useTranslate()
  const currentPath = useCurrentPath()
  const navigation = useRef<HTMLElement>(null)
  const header = useRef<HTMLElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const navigationId = useId()
  // Kept as the path it was opened on, so a navigation closes it.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null)
  const isMenuOpen = menuOpenedOn === currentPath

  const currentSectionPath =
    SECTIONS.find((section) => isInSection({ currentPath, section }))?.path ??
    null

  // On a phone the row scrolls: the current section must not sit out of view.
  useEffect(() => {
    const row = navigation.current
    const current =
      currentSectionPath === null
        ? null
        : row?.querySelector<HTMLElement>(`[href="${currentSectionPath}"]`)

    if (row !== null && current !== null && current !== undefined) {
      row.scrollLeft =
        current.offsetLeft +
        current.offsetWidth -
        row.offsetLeft -
        row.clientWidth
    }
  }, [currentSectionPath])

  // A tap or a click outside the header, or Escape, closes the menu; Escape
  // hands focus back to the button that opened it.
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const closeFromOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        header.current?.contains(event.target) !== true
      ) {
        setMenuOpenedOn(null)
      }
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpenedOn(null)
        menuButton.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMenuOpen])

  // The browser leaves a link that is partly in view where it is: on a phone
  // a focused one must come fully into the row.
  const bringFocusedLinkIntoView = (event: React.FocusEvent<HTMLElement>) => {
    event.target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  return (
    <header className='site-header' ref={header}>
      <SkipLink />
      <div className='site-header-row'>
        <Link
          aria-label={translate('header.home')}
          className='wordmark'
          href={paths.compare}
        >
          <span aria-hidden='true' className='wordmark-card' />
          <span className='wordmark-text'>{translate('common.siteName')}</span>
        </Link>
        <Button
          aria-controls={navigationId}
          aria-expanded={isMenuOpen}
          className='site-menu-button'
          onPress={() => setMenuOpenedOn(isMenuOpen ? null : currentPath)}
          ref={menuButton}
        >
          <Icon name={isMenuOpen ? 'clear' : 'menu'} />
          {translate('header.menu')}
        </Button>
        <nav
          aria-label={translate('header.navigation')}
          className='site-nav'
          data-open={isMenuOpen || undefined}
          id={navigationId}
          onFocus={bringFocusedLinkIntoView}
          ref={navigation}
        >
          {SECTIONS.map((section) => {
            const isCurrent = isInSection({
              currentPath,
              section
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
