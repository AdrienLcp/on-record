import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { use } from 'react'

import {
  type Declaration,
  type DeclaredItem,
  INTEREST_SECTION_ORDER,
  type InterestSections,
  type InterestsSummary,
  isAssetDeclaration
} from '@on-record/protocol/hatvp/hatvp-record'

import {
  HATVP_OPEN_DATA_URL,
  OPEN_LICENCE_URL
} from '@/features/sources/official-urls'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { dateOfDay, dateOfMonth, dateOfTimestamp } from '@/infrastructure/dates'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import {
  type DeclarationPhrase,
  declarationPhrasesOf,
  readableUrlOf
} from './declaration-phrases'
import type { HatvpCardData } from './hatvp-api'

import './hatvp-declarations.sass'

/** The card's anchor, so a shared link can point at it. */
const HATVP_FRAGMENT = 'declarations-hatvp'

const ItemPeriod: React.FC<{ item: DeclaredItem }> = ({ item }) => {
  const translate = useTranslate()

  if (item.from !== null && item.to !== null) {
    return translate('hatvp.interests.item.period', {
      from: dateOfMonth(item.from),
      to: dateOfMonth(item.to)
    })
  }

  if (item.from !== null) {
    return translate('hatvp.interests.item.from', {
      from: dateOfMonth(item.from)
    })
  }

  if (item.to !== null) {
    return translate('hatvp.interests.item.to', { to: dateOfMonth(item.to) })
  }

  return null
}

const DeclaredItemLine: React.FC<{ item: DeclaredItem }> = ({ item }) => {
  const translate = useTranslate()
  const hasPeriod = item.from !== null || item.to !== null

  return (
    <li className='declared-item'>
      <span className='declared-label'>
        {item.label ??
          item.organisation ??
          translate('hatvp.interests.item.withheld')}
      </span>
      {item.label !== null && item.organisation !== null && (
        <span className='declared-organisation'>{item.organisation}</span>
      )}
      {(hasPeriod || item.isKept) && (
        <span className='declared-detail'>
          <ItemPeriod item={item} />
          {hasPeriod && item.isKept && ', '}
          {item.isKept && translate('hatvp.interests.item.kept')}
        </span>
      )}
    </li>
  )
}

/** Lines a section shows before folding the rest: some declare sixty bodies they sit on. */
const LINES_SHOWN_PER_SECTION = 4

const DeclaredItemList: React.FC<{ items: readonly DeclaredItem[] }> = ({
  items
}) => (
  <ul className='declared-items'>
    {items.map((item) => (
      <DeclaredItemLine
        item={item}
        key={`${item.label}-${item.organisation}-${item.from}-${item.to}`}
      />
    ))}
  </ul>
)

const SectionContent: React.FC<{
  name: keyof InterestSections
  sections: InterestSections
}> = ({ name, sections }) => {
  const translate = useTranslate()

  if (name === 'collaborators' || name === 'spouseActivities') {
    const section = sections[name]

    return (
      <p className='interest-section-value'>
        {section.status === 'none'
          ? translate('hatvp.interests.none')
          : translate(`hatvp.interests.thirdParty.${name}`, {
              count: section.count
            })}
      </p>
    )
  }

  const section = sections[name]

  if (section.status === 'none') {
    return (
      <p className='interest-section-value'>
        {translate('hatvp.interests.none')}
      </p>
    )
  }

  const shown = section.items.slice(0, LINES_SHOWN_PER_SECTION)
  const folded = section.items.slice(LINES_SHOWN_PER_SECTION)

  return (
    <>
      <DeclaredItemList items={shown} />
      {folded.length > 0 && (
        <details className='more-declared-items'>
          <summary>
            {translate('hatvp.interests.more', { count: folded.length })}
          </summary>
          <DeclaredItemList items={folded} />
        </details>
      )}
    </>
  )
}

const InterestsDeclared: React.FC<{ interests: InterestsSummary }> = ({
  interests
}) => {
  const translate = useTranslate()
  const { sections } = interests
  const hasThirdParties =
    sections.collaborators.status === 'listed' ||
    sections.spouseActivities.status === 'listed'

  return (
    <div className='hatvp-block'>
      <h3 className='hatvp-subheading'>{translate('hatvp.interests.title')}</h3>
      <p className='hatvp-filed'>
        {translate('hatvp.interests.filed', {
          day: dateOfDay(interests.filedOn)
        })}{' '}
        <TextLink href={interests.pdfUrl} target='_blank'>
          {translate('hatvp.interests.pdf')}
        </TextLink>
      </p>
      <ol className='ruled-list interest-sections'>
        {INTEREST_SECTION_ORDER.map((name) => (
          <li
            className={
              sections[name].status === 'none'
                ? 'interest-section declared-none'
                : 'interest-section'
            }
            data-section={name}
            key={name}
          >
            <h4 className='interest-section-name'>
              {translate(`hatvp.interests.sections.${name}`)}
            </h4>
            <SectionContent name={name} sections={sections} />
          </li>
        ))}
      </ol>
      {hasThirdParties && (
        <p className='record-note'>
          {translate('hatvp.interests.thirdParty.note')}
        </p>
      )}
    </div>
  )
}

const PhraseText: React.FC<{ phrase: DeclarationPhrase }> = ({ phrase }) => {
  const translate = useTranslate()

  return 'day' in phrase
    ? translate(`hatvp.declarations.phrases.${phrase.key}`, {
        day: dateOfDay(phrase.day)
      })
    : translate(`hatvp.declarations.phrases.${phrase.key}`)
}

const DeclarationLine: React.FC<{ declaration: Declaration }> = ({
  declaration
}) => {
  const translate = useTranslate()
  const name = translate(`hatvp.declarations.kinds.${declaration.kind}`)
  const url = readableUrlOf(declaration)

  return (
    <li className='declaration-line'>
      {url === null ? (
        <span className='declaration-kind'>{name}</span>
      ) : (
        <TextLink className='declaration-kind' href={url} target='_blank'>
          {name}
        </TextLink>
      )}
      <span className='declaration-state'>
        {declarationPhrasesOf(declaration).map((phrase, index) => (
          <span className='declaration-phrase' key={phrase.key}>
            {index > 0 && <span aria-hidden='true'> · </span>}
            <PhraseText phrase={phrase} />
          </span>
        ))}
      </span>
    </li>
  )
}

const SourceLine: React.FC<{ sourceDate: string | null }> = ({
  sourceDate
}) => {
  const translate = useTranslate()
  const links = {
    hatvp: (children: React.ReactNode) => (
      <TextLink href={HATVP_OPEN_DATA_URL} key='hatvp' target='_blank'>
        {children}
      </TextLink>
    ),
    licence: (children: React.ReactNode) => (
      <TextLink href={OPEN_LICENCE_URL} key='licence' target='_blank'>
        {children}
      </TextLink>
    )
  }

  return (
    <p className='record-note hatvp-source'>
      <RichText
        parts={
          sourceDate === null
            ? translate.rich('hatvp.sourceUndated', links)
            : translate.rich('hatvp.source', {
                ...links,
                day: dateOfTimestamp(sourceDate)
              })
        }
      />
    </p>
  )
}

const HatvpRecordCard: React.FC<{ data: HatvpCardData }> = ({ data }) => {
  const translate = useTranslate()
  const { declarations, interests, page } = data.record
  const hasAssetDeclarations = declarations.some((declaration) =>
    isAssetDeclaration(declaration.kind)
  )

  return (
    <RecordCard heading={translate('hatvp.title')}>
      <p className='record-note'>
        {translate('hatvp.lead')}
        {interests !== null && ` ${translate('hatvp.leadReuse')}`}
      </p>
      {interests !== null && <InterestsDeclared interests={interests} />}
      {declarations.length === 0 ? (
        <p className='hatvp-empty'>{translate('hatvp.empty')}</p>
      ) : (
        <div className='hatvp-block'>
          <h3 className='hatvp-subheading'>
            {translate('hatvp.declarations.title')}
          </h3>
          {interests === null && (
            <p className='hatvp-empty'>{translate('hatvp.interests.notYet')}</p>
          )}
          <ul className='ruled-list declaration-list'>
            {declarations.map((declaration) => (
              <DeclarationLine
                declaration={declaration}
                key={`${declaration.kind}-${declaration.filedOn}-${declaration.status}`}
              />
            ))}
          </ul>
          {hasAssetDeclarations && (
            <p className='record-note'>{translate('hatvp.assetsNote')}</p>
          )}
        </div>
      )}
      {page !== null && (
        <p className='hatvp-page'>
          <TextLink href={page} target='_blank'>
            {translate('hatvp.page')}
          </TextLink>
        </p>
      )}
      <SourceLine sourceDate={data.sourceDate} />
    </RecordCard>
  )
}

type HatvpDeclarationsProps = {
  data: Promise<Result<HatvpCardData, DatasetError>>
}

/**
 * What a parliamentarian declared to the HATVP for their current mandate:
 * the latest declaration of interests section by section, and every
 * declaration with its dates. Asset declarations are dated, never linked.
 */
export const HatvpDeclarations: React.FC<HatvpDeclarationsProps> = ({
  data
}) => {
  const result = use(data)

  return (
    <div className='hatvp-declarations' id={HATVP_FRAGMENT}>
      {result.status === 'failure' ? (
        <DatasetFailure error={result.error} />
      ) : (
        <HatvpRecordCard data={result.data} />
      )}
    </div>
  )
}
