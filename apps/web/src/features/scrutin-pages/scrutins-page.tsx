import type React from 'react'
import { Suspense, use } from 'react'

import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { ScrutinLine } from '@/features/scrutins/scrutin-line'
import {
  filterScrutins,
  KIND_FILTERS,
  newestFirst,
  OUTCOME_FILTERS,
  parseKindFilter,
  parseOutcomeFilter
} from '@/features/scrutins/scrutin-search'
import { useSearchValue } from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { FilterBar } from '@/presentation/components/filter-bar'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { SearchField } from '@/presentation/components/ui/search-field'
import { Select, SelectItem } from '@/presentation/components/ui/select'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useScrutinsData } from './scrutins-loader'

import './scrutins-page.sass'

const SCRUTINS_PER_PAGE = 30

const ScrutinRegister: React.FC<{ scrutins: readonly ScrutinSummary[] }> = ({
  scrutins
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useSearchValue('query')
  const [kindValue, setKind] = useSearchValue('kind')
  const [outcomeValue, setOutcome] = useSearchValue('outcome')
  const filters = {
    kind: parseKindFilter(kindValue),
    outcome: parseOutcomeFilter(outcomeValue),
    query: query ?? ''
  }
  const shown = newestFirst(filterScrutins({ filters, scrutins }))

  return (
    <>
      <FilterBar legend={translate('scrutins.filtersLegend')}>
        <ToggleButtonGroup
          aria-label={translate('scrutins.kind')}
          className='kind-tabs'
          onSelectionChange={(keys) => {
            const [kind] = keys
            setKind(kind === 'all' || typeof kind !== 'string' ? null : kind)
          }}
          selectedKeys={[filters.kind]}
        >
          {KIND_FILTERS.map((kind) => (
            <ToggleButton id={kind} key={kind}>
              {translate(`scrutins.kindTabs.${kind}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <SearchField
          label={translate('scrutins.search')}
          onChange={setQuery}
          value={query ?? ''}
        />
        <Select
          label={translate('scrutins.outcome.label')}
          onChange={(key) => {
            setOutcome(key === 'all' || typeof key !== 'string' ? null : key)
          }}
          value={filters.outcome}
        >
          {OUTCOME_FILTERS.map((outcome) => (
            <SelectItem id={outcome} key={outcome}>
              {translate(`scrutins.outcome.${outcome}`)}
            </SelectItem>
          ))}
        </Select>
      </FilterBar>
      <RecordCard
        heading={translate('scrutins.resultCount', { count: shown.length })}
      >
        <p className='record-note'>{translate('common.nominalOnly')}</p>
        {shown.length === 0 ? (
          <p className='record-note'>{translate('scrutins.empty')}</p>
        ) : (
          <ProgressiveList
            items={shown}
            key={JSON.stringify(filters)}
            keyOf={(scrutin) => scrutin.number}
            pageSize={SCRUTINS_PER_PAGE}
            renderItem={(scrutin) => <ScrutinLine scrutin={scrutin} />}
          />
        )}
      </RecordCard>
    </>
  )
}

const RegisterOrFailure: React.FC = () => {
  const { scrutins } = useScrutinsData()
  const result = use(scrutins)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <ScrutinRegister scrutins={result.data} />
  )
}

export const ScrutinsPage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('scrutins.title'))

  return (
    <Main className='scrutins-page'>
      <PageIntro
        lead={translate('scrutins.lead')}
        title={translate('scrutins.title')}
      />
      <Suspense fallback={<LoadingLines lines={8} />}>
        <RegisterOrFailure />
      </Suspense>
    </Main>
  )
}
