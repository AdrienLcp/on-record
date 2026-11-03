import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { DatasetsMeta } from '@on-record/protocol/datasets'

import {
  HATVP_OPEN_DATA_URL,
  OPEN_DATA_URL,
  OPEN_LICENCE_URL,
  SENATE_OPEN_DATA_URL
} from '@/features/sources/official-urls'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfTimestamp } from '@/infrastructure/dates'
import { paths } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { LOCALE } from '@/presentation/i18n/locale'
import { RichText } from '@/presentation/i18n/rich-text'
import { AUTHOR, SOURCE_REPOSITORY_HREF } from '@/presentation/site-credits'
import { ThemeSwitch } from '@/presentation/theme/theme-switch'

import './site-footer.sass'

type MetaResult = Promise<Result<DatasetsMeta, DatasetError>>

type SiteFooterProps = {
  /** Where the date of the last update comes from. */
  meta: MetaResult
}

/** Unreadable metadata leaves the footer without its date, never without its source. */
const LastUpdate: React.FC<{ meta: MetaResult }> = ({ meta }) => {
  const translate = useTranslate()
  const result = use(meta)

  if (result.status === 'failure') {
    return null
  }

  return (
    <p className='last-update'>
      {translate('footer.updated', {
        day: dateOfTimestamp(result.data.generatedAt)
      })}
    </p>
  )
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ meta }) => {
  const translate = useTranslate()

  return (
    <footer className='site-footer'>
      <div className='site-footer-row'>
        <div className='site-footer-source'>
          <p>
            <RichText
              parts={translate.rich('footer.source', {
                hatvp: (children) => (
                  <TextLink
                    href={HATVP_OPEN_DATA_URL}
                    key='hatvp'
                    target='_blank'
                  >
                    {children}
                  </TextLink>
                ),
                licence: (children) => (
                  <TextLink
                    href={OPEN_LICENCE_URL}
                    key='licence'
                    target='_blank'
                  >
                    {children}
                  </TextLink>
                ),
                senate: (children) => (
                  <TextLink
                    href={SENATE_OPEN_DATA_URL}
                    key='senate'
                    target='_blank'
                  >
                    {children}
                  </TextLink>
                ),
                source: (children) => (
                  <TextLink href={OPEN_DATA_URL} key='source' target='_blank'>
                    {children}
                  </TextLink>
                )
              })}
            />
          </p>
          <Suspense fallback={null}>
            <LastUpdate meta={meta} />
          </Suspense>
        </div>
        <nav
          aria-label={translate('footer.navigation')}
          className='site-footer-links'
        >
          <TextLink className='method-link' href={paths.method}>
            {translate('footer.method')}
          </TextLink>
          <TextLink href={paths.legal}>{translate('footer.legal')}</TextLink>
          {SOURCE_REPOSITORY_HREF !== null && (
            <TextLink href={SOURCE_REPOSITORY_HREF} target='_blank'>
              {translate('footer.sourceCode')}
            </TextLink>
          )}
          <p>
            <RichText
              parts={translate.rich('footer.credit', {
                author: (children) => (
                  <TextLink
                    href={AUTHOR.siteHref[LOCALE]}
                    key='author'
                    target='_blank'
                  >
                    {children}
                  </TextLink>
                ),
                name: AUTHOR.name
              })}
            />
          </p>
        </nav>
        <ThemeSwitch />
      </div>
    </footer>
  )
}
