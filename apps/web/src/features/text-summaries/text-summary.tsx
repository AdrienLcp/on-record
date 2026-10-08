import type React from 'react'

import { ScrutinSubject } from '@/features/scrutins/scrutin-subject'
import type { ScrutinTitle } from '@/features/scrutins/scrutin-title'
import { officialLegislativeFileUrl } from '@/features/sources/official-urls'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { legislatureOfFile, type SummarisedFileId } from './summarised-text'

import './text-summary.sass'

type TextSummaryProps = {
  summarisedFile: SummarisedFileId
  /** Left out where the page already quotes the official title. */
  title?: ScrutinTitle
}

/**
 * What a text changes, in a few plain sentences written by on-record, then
 * who wrote them, the official title they stand in for and the official file.
 */
export const TextSummary: React.FC<TextSummaryProps> = ({
  summarisedFile,
  title
}) => {
  const translate = useTranslate()

  return (
    <section className='text-summary'>
      <h4 className='text-summary-label'>{translate('textSummaries.label')}</h4>
      <p className='text-summary-body'>
        {translate(`textSummaries.texts.${summarisedFile}.summary`)}
      </p>
      <p className='text-summary-source'>
        {translate('textSummaries.writtenBy')}{' '}
        {title !== undefined && (
          <>
            {translate('textSummaries.officialTitle')}{' '}
            <cite>
              <ScrutinSubject title={title} />
            </cite>
            {' · '}
          </>
        )}
        <TextLink
          href={officialLegislativeFileUrl({
            legislativeFileId: summarisedFile,
            legislature: legislatureOfFile(summarisedFile)
          })}
          target='_blank'
        >
          {translate('textSummaries.officialFile')}
        </TextLink>
      </p>
    </section>
  )
}
