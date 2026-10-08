import type React from 'react'

import { TextKindTag } from '@/features/scrutins/text-kind-tag'
import { summarisedFileOf } from '@/features/text-summaries/summarised-text'
import { TextName } from '@/features/text-summaries/text-name'
import { TextSummary } from '@/features/text-summaries/text-summary'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ComparedKind, ComparedParty } from './party-comparison'
import { TextReading } from './text-reading'
import type { ComparedText } from './text-readings'

import './text-list.sass'

const TEXTS_PER_PAGE = 10

const TextHeading: React.FC<{ text: ComparedText }> = ({ text }) => {
  const translate = useTranslate()
  const { title } = text
  const summarisedFile = summarisedFileOf(text.readings)

  return (
    <header className='text-entry-head'>
      <h3 className='text-entry-name'>
        <TextName summarisedFile={summarisedFile} title={title} />
      </h3>
      {title.kind !== 'censure' && (
        <span className='text-entry-count'>
          {translate('compare.texts.readingCount', {
            count: text.readings.length
          })}
        </span>
      )}
      {title.kind === 'text' && (
        <p className='text-entry-detail'>
          <TextKindTag textKind={title.textKind} />
        </p>
      )}
      {title.kind === 'censure' && (
        <p className='text-entry-detail'>
          {translate('scrutinTitle.censure.tabledBy', {
            authors: title.authors
          })}
        </p>
      )}
      {summarisedFile !== null && (
        <TextSummary summarisedFile={summarisedFile} title={title} />
      )}
    </header>
  )
}

type TextListProps = {
  kind: ComparedKind
  /** Changes with the filters, so a new search starts again from the top. */
  listKey: string
  parties: readonly ComparedParty[]
  texts: readonly ComparedText[]
}

/**
 * One entry per text, each time the Assemblée voted it in order: every
 * compared party's stance at each reading, and who changed sides since the
 * previous one. A motion of censure is an entry of its own.
 */
export const TextList: React.FC<TextListProps> = ({
  kind,
  listKey,
  parties,
  texts
}) => (
  <div className='text-list'>
    <ProgressiveList
      items={texts}
      key={listKey}
      keyOf={(text) => text.readings[0]?.number ?? 0}
      pageSize={TEXTS_PER_PAGE}
      renderItem={(text) => (
        <article className='text-entry'>
          <TextHeading text={text} />
          <ol className='text-readings'>
            {text.readings.map((vote, index) => (
              <TextReading
                key={vote.number}
                kind={kind}
                parties={parties}
                previous={text.readings[index - 1]}
                vote={vote}
              />
            ))}
          </ol>
        </article>
      )}
    />
  </div>
)
