import type React from 'react'

import { OutcomeStamp } from '@/features/scrutins/outcome-stamp'
import { officialAmendmentUrl } from '@/features/sources/official-urls'
import { dateOfDay } from '@/infrastructure/dates'
import { scrutinPathFor } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { AmendmentLine } from './amendment-search'
import { stageOf } from './amendment-stage'
import { parseArticleDesignation } from './article-designation'

import './tabled-amendment-line.sass'

/** Where in the text the amendment applies, in plain French. */
const ArticleTargetLabel: React.FC<{ article: string }> = ({ article }) => {
  const translate = useTranslate()
  const target = parseArticleDesignation(article)

  switch (target.kind) {
    case 'article':
      return translate(
        `amendments.article.${target.placement}.${target.plural ? 'many' : 'one'}`,
        { designation: target.designation }
      )
    case 'title':
      return translate('amendments.article.title')
    case 'other':
      return target.text
  }
}

type TabledAmendmentLineProps = {
  /** Builds the link to the official page. */
  legislature: number
  line: AmendmentLine
}

/**
 * One amendment as a line of the register: its number, date and stage, the
 * text and the article it changes, its author's summary, and what became of it.
 */
export const TabledAmendmentLine: React.FC<TabledAmendmentLineProps> = ({
  legislature,
  line
}) => {
  const translate = useTranslate()

  return (
    <article className='amendment-line'>
      <p className='amendment-line-reference'>
        <span>{translate('amendments.number', { number: line.number })}</span>
        {line.date !== null && (
          <>
            <span aria-hidden='true'>·</span>
            <time dateTime={line.date}>
              {translate('common.shortDay', { day: dateOfDay(line.date) })}
            </time>
          </>
        )}
        <span aria-hidden='true'>·</span>
        <span className='amendment-stage'>
          {translate(`amendments.stage.${stageOf(line.organ)}`)}
        </span>
      </p>
      <h3 className='amendment-line-title'>
        {line.fileTitle ?? translate('amendments.unknownFile')}
      </h3>
      {(line.article !== null || line.asRapporteur) && (
        <p className='amendment-line-target'>
          {line.article !== null && (
            <span className='amendment-article'>
              <ArticleTargetLabel article={line.article} />
            </span>
          )}
          {line.asRapporteur && (
            <span className='amendment-rapporteur'>
              {translate('amendments.asRapporteur')}
            </span>
          )}
        </p>
      )}
      {line.summary !== null && (
        <blockquote className='amendment-line-summary'>
          <p>{line.summary}</p>
        </blockquote>
      )}
      <div className='amendment-line-result'>
        <OutcomeStamp outcome={line.outcome} />
        {line.scrutin !== null && (
          <TextLink href={scrutinPathFor(line.scrutin)}>
            {translate('amendments.scrutin', { number: line.scrutin })}
          </TextLink>
        )}
        {line.officialPath !== null && (
          <TextLink
            href={officialAmendmentUrl({
              legislature,
              officialPath: line.officialPath
            })}
            target='_blank'
          >
            {translate('amendments.officialPage')}
          </TextLink>
        )}
      </div>
    </article>
  )
}
