import type React from 'react'
import { Suspense, use } from 'react'

import type {
  MissingSenateScrutin,
  SenateScrutinIndex
} from '@on-record/protocol/senate/senate-scrutin'

import {
  OUTCOME_FILTERS,
  parseOutcomeFilter
} from '@/features/scrutins/scrutin-search'
import { SenateScrutinLine } from '@/features/senate-scrutins/senate-scrutin-line'
import {
  filterSenateScrutins,
  newestMissingFirst,
  parseSenateKindFilter,
  SENATE_KIND_FILTERS
} from '@/features/senate-scrutins/senate-scrutin-search'
import { officialSenateScrutinUrl } from '@/features/sources/official-urls'
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
import { TextLink } from '@/presentation/components/ui/text-link'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useSenateScrutinsData } from './senate-scrutins-loader'

import './senate-scrutins-page.sass'

const SCRUTINS_PER_PAGE = 30

/** The scrutins the Senate numbered but left out of its open data, each with its official page. */
const MissingScrutins: React.FC<{
  missing: readonly MissingSenateScrutin[]
}> = ({ missing }) => {
  const translate = useTranslate()

  return (
    <details className='missing-scrutins'>
      <summary>
        {translate('senateScrutins.missing.title', { count: missing.length })}
      </summary>
      <p className='record-note'>{translate('senateScrutins.missing.lead')}</p>
      <ul className='missing-scrutins-list'>
        {newestMissingFirst(missing).map((scrutin) => (
          <li key={scrutin.id}>
            <TextLink href={officialSenateScrutinUrl(scrutin)} target='_blank'>
              {translate('senateScrutin.reference', {
                nextYear: scrutin.session + 1,
                number: scrutin.number,
                session: scrutin.session
              })}
            </TextLink>
          </li>
        ))}
      </ul>
    </details>
  )
}

const SenateScrutinRegister: React.FC<{ index: SenateScrutinIndex }> = ({
  index
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useSearchValue('query')
  const [kindValue, setKind] = useSearchValue('kind')
  const [outcomeValue, setOutcome] = useSearchValue('outcome')
  const filters = {
    kind: parseSenateKindFilter(kindValue),
    outcome: parseOutcomeFilter(outcomeValue),
    query: query ?? ''
  }
  const shown = filterSenateScrutins({ filters, scrutins: index.scrutins })

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
          {SENATE_KIND_FILTERS.map((kind) => (
            <ToggleButton id={kind} key={kind}>
              {translate(`scrutins.kindTabs.${kind}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <SearchField
          label={translate('senateScrutins.search')}
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
        <p className='record-note'>{translate('senateScrutin.nominalOnly')}</p>
        {index.missing.length > 0 && (
          <MissingScrutins missing={index.missing} />
        )}
        {shown.length === 0 ? (
          <p className='record-note'>{translate('scrutins.empty')}</p>
        ) : (
          <ProgressiveList
            items={shown}
            key={JSON.stringify(filters)}
            keyOf={(scrutin) => scrutin.id}
            pageSize={SCRUTINS_PER_PAGE}
            renderItem={(scrutin) => <SenateScrutinLine scrutin={scrutin} />}
          />
        )}
      </RecordCard>
    </>
  )
}

const RegisterOrFailure: React.FC = () => {
  const { index } = useSenateScrutinsData()
  const result = use(index)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <SenateScrutinRegister index={result.data} />
  )
}

export const SenateScrutinsPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='senate-scrutins-page'>
      <DocumentTitle>
        {documentTitleFor(translate('senateScrutins.title'))}
      </DocumentTitle>
      <PageIntro
        lead={translate('senateScrutins.lead')}
        title={translate('senateScrutins.title')}
      />
      <Suspense fallback={<LoadingLines lines={8} />}>
        <RegisterOrFailure />
      </Suspense>
    </Main>
  )
}
