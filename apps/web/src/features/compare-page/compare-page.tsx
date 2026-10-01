import type React from 'react'
import { Suspense, use } from 'react'

import { usePartySelection } from '@/features/parties/use-party-selection'
import {
  groupPathFor,
  useSearchValue
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { SearchField } from '@/presentation/components/ui/search-field'
import { TextLink } from '@/presentation/components/ui/text-link'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import { type Comparison, useCompareData } from './compare-loader'
import { ComparedPartiesField } from './compared-parties-field'
import {
  COMPARED_KINDS,
  comparedKindSearchValue,
  comparedPartiesOf,
  compareVotes,
  countVotesOfKind,
  parseComparedKind
} from './party-comparison'
import { type LedgerColumn, VoteLedger } from './vote-ledger'

import './compare-page.sass'

/** One party chosen: nothing to set beside it, but its group's page has every vote. */
const NothingToCompare: React.FC<{ column: LedgerColumn }> = ({ column }) => {
  const translate = useTranslate()

  return (
    <RecordCard heading={translate('compare.onlyOne.title')}>
      <p className='compare-only-one'>
        <RichText
          parts={translate.rich('compare.onlyOne.text', {
            acronym:
              column.group?.shortName ??
              translate(`party.names.${column.party.id}`),
            group: (children) => (
              <TextLink href={groupPathFor(column.party.groupId)} key='group'>
                {children}
              </TextLink>
            ),
            party: translate(`party.names.${column.party.id}`),
            strong: (children) => <strong key='strong'>{children}</strong>
          })}
        />
      </p>
    </RecordCard>
  )
}

const ComparisonView: React.FC<{ comparison: Comparison }> = ({
  comparison
}) => {
  const translate = useTranslate()
  const parties = usePartySelection()
  const [kindValue, setKind] = useSearchValue('kind')
  const [splitValue, setSplit] = useSearchValue('onlySplit')
  const [query, setQuery] = useSearchValue('query')
  const filters = {
    kind: parseComparedKind(kindValue),
    onlySplit: splitValue === '1',
    query: query ?? ''
  }
  const columns: LedgerColumn[] = comparedPartiesOf(parties.choices).map(
    (party) => ({
      group: comparison.groups.find((group) => group.id === party.groupId),
      party
    })
  )
  const { matching, shown, split } = compareVotes({
    filters,
    groupIds: columns.map((column) => column.party.groupId),
    votes: comparison.votes
  })
  const [onlyColumn] = columns

  return (
    <>
      <ComparedPartiesField groups={comparison.groups} selection={parties} />
      <SearchField
        className='compare-search'
        label={translate('compare.search')}
        onChange={setQuery}
        value={query ?? ''}
      />
      {columns.length === 1 && onlyColumn !== undefined ? (
        <NothingToCompare column={onlyColumn} />
      ) : (
        <div className='compare-register'>
          <ToggleButtonGroup
            aria-label={translate('compare.kindsLabel')}
            onSelectionChange={(keys) => {
              const [key] = keys
              const kind = COMPARED_KINDS.find((each) => each === key)
              if (kind !== undefined) {
                setKind(comparedKindSearchValue(kind))
              }
            }}
            selectedKeys={[filters.kind]}
          >
            {COMPARED_KINDS.map((kind) => (
              <ToggleButton id={kind} key={kind}>
                {translate(`compare.kinds.${kind}`)}
                <span className='tab-count'>
                  {countVotesOfKind({ kind, votes: comparison.votes })}
                </span>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <RecordCard
            className='compare-card'
            heading={translate(`compare.heading.${filters.kind}`)}
            reference={translate('common.countOf', {
              shown: shown.length,
              total: matching.length
            })}
          >
            <label className='compare-split'>
              <input
                checked={filters.onlySplit}
                onChange={(event) =>
                  setSplit(event.target.checked ? '1' : null)
                }
                type='checkbox'
              />
              {translate('compare.onlySplit')}
              <span className='tab-count'>{split.length}</span>
            </label>
            {shown.length === 0 ? (
              <p className='compare-empty'>
                {matching.length === 0
                  ? translate('compare.empty.noMatch')
                  : translate('compare.empty.sameEverywhere')}
              </p>
            ) : (
              <VoteLedger columns={columns} kind={filters.kind} votes={shown} />
            )}
            <div className='compare-notes'>
              <p className='record-note'>
                {translate(`compare.notes.${filters.kind}`)}
              </p>
              <p className='record-note'>{translate('common.nominalOnly')}</p>
            </div>
          </RecordCard>
        </div>
      )}
    </>
  )
}

const ComparisonOrFailure: React.FC = () => {
  const { comparison } = useCompareData()
  const result = use(comparison)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <ComparisonView comparison={result.data} />
  )
}

export const ComparePage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('compare.title'))

  return (
    <Main className='compare-page'>
      <PageIntro
        lead={translate('compare.lead')}
        title={translate('compare.title')}
      />
      <Suspense fallback={<LoadingLines lines={10} />}>
        <ComparisonOrFailure />
      </Suspense>
    </Main>
  )
}
