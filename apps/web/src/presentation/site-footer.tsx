import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { Suspense, use } from 'react'

import type { DatasetsMeta } from '@on-record/protocol/datasets'

import {
  OPEN_DATA_URL,
  OPEN_LICENCE_URL,
  SENATE_OPEN_DATA_URL
} from '@/features/sources/official-urls'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfTimestamp } from '@/infrastructure/dates'
import { paths } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'
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
        <TextLink className='method-link' href={paths.method}>
          {translate('footer.method')}
        </TextLink>
        <ThemeSwitch />
      </div>
    </footer>
  )
}
