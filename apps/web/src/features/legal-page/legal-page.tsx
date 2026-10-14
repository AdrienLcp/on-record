import type React from 'react'

import {
  HATVP_OPEN_DATA_URL,
  OPEN_DATA_URL,
  OPEN_LICENCE_URL,
  SENATE_OPEN_DATA_URL
} from '@/features/sources/official-urls'
import { paths } from '@/infrastructure/router/navigation'
import { ANALYTICS_OPT_OUT_KEY } from '@/infrastructure/storage/analytics-opt-out-storage'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'
import { THEME_STORAGE_KEY } from '@/presentation/theme/theme-store'

import {
  CNIL_COMPLAINT_HREF,
  GEOCODER_HOST,
  HOST,
  MEASUREMENT_HREF,
  MEASUREMENT_RETENTION_MONTHS,
  PUBLISHER
} from './legal-details'
import { MeasurementSwitch } from './measurement-switch'

import './legal-page.sass'

const outsideLink =
  (href: string) =>
  (children: string): React.ReactNode => (
    <TextLink href={href} key={href} target='_blank'>
      {children}
    </TextLink>
  )

const contactLink = outsideLink(PUBLISHER.contactHref)

/**
 * The French LCEN's legal notice and the privacy policy, on one page every
 * footer links to: who publishes, who hosts, where the data on officials
 * comes from, what the browser keeps and sends, and the visitor's rights.
 */
export const LegalPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='legal-page'>
      <DocumentTitle>
        {documentTitleFor(translate('legal.title'))}
      </DocumentTitle>
      <PageIntro
        lead={translate('legal.lead')}
        title={translate('legal.title')}
      />

      <RecordCard heading={translate('legal.publisher.heading')}>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.publisher.body', {
              contact: contactLink,
              name: PUBLISHER.name
            })}
          />
        </p>
        <p className='record-note'>{translate('legal.publisher.address')}</p>
      </RecordCard>

      <RecordCard heading={translate('legal.host.heading')}>
        <p className='legal-prose'>{translate('legal.host.body')}</p>
        <address className='host-address'>
          {[HOST.name, ...HOST.addressLines].map((line) => (
            <span key={line}>{line}</span>
          ))}
        </address>
      </RecordCard>

      <RecordCard heading={translate('legal.officials.heading')}>
        <p className='legal-prose'>{translate('legal.officials.body')}</p>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.officials.sources', {
              assembly: outsideLink(OPEN_DATA_URL),
              hatvp: outsideLink(HATVP_OPEN_DATA_URL),
              licence: outsideLink(OPEN_LICENCE_URL),
              method: (children) => (
                <TextLink href={paths.method} key='method'>
                  {children}
                </TextLink>
              ),
              senate: outsideLink(SENATE_OPEN_DATA_URL)
            })}
          />
        </p>
        <p className='legal-prose'>{translate('legal.officials.basis')}</p>
        <p className='legal-prose'>{translate('legal.officials.retention')}</p>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.officials.correction', {
              contact: contactLink
            })}
          />
        </p>
      </RecordCard>

      <RecordCard heading={translate('legal.storage.heading')}>
        <p className='legal-prose'>{translate('legal.storage.device')}</p>
        <dl className='ruled-pairs'>
          <div>
            <dt>
              <code>{THEME_STORAGE_KEY}</code>
            </dt>
            <dd>{translate('legal.storage.theme')}</dd>
          </div>
          <div>
            <dt>
              <code>{ANALYTICS_OPT_OUT_KEY}</code>
            </dt>
            <dd>{translate('legal.storage.analyticsOptOut')}</dd>
          </div>
        </dl>
        <p className='legal-prose'>{translate('legal.storage.server')}</p>
      </RecordCard>

      <RecordCard heading={translate('legal.thirdParties.heading')}>
        <dl className='ruled-pairs'>
          <div>
            <dt>{HOST.name}</dt>
            <dd>{translate('legal.thirdParties.host')}</dd>
          </div>
          <div>
            <dt>{translate('legal.thirdParties.geocoderName')}</dt>
            <dd>
              {translate('legal.thirdParties.geocoder', {
                host: GEOCODER_HOST
              })}
            </dd>
          </div>
        </dl>
        <p className='legal-prose'>
          {translate('legal.thirdParties.nothingElse')}
        </p>
      </RecordCard>

      <RecordCard heading={translate('legal.measurement.heading')}>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.measurement.body', {
              dashboard: outsideLink(MEASUREMENT_HREF)
            })}
          />
        </p>
        <p className='legal-prose'>
          {translate('legal.measurement.retention', {
            months: MEASUREMENT_RETENTION_MONTHS
          })}
        </p>
        <p className='legal-prose'>
          {translate('legal.measurement.exemption')}
        </p>
        <MeasurementSwitch />
      </RecordCard>

      <RecordCard heading={translate('legal.rights.heading')}>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.rights.body', {
              contact: contactLink
            })}
          />
        </p>
        <p className='legal-prose'>
          <RichText
            parts={translate.rich('legal.rights.complaint', {
              authority: outsideLink(CNIL_COMPLAINT_HREF)
            })}
          />
        </p>
      </RecordCard>
    </Main>
  )
}
