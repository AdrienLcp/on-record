import type React from 'react'
import { Suspense, use } from 'react'

import { compareDeputyNames } from '@on-record/protocol/assembly/deputy-name-order'
import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type { Senator } from '@on-record/protocol/senate/senator'

import { parseDeputyScope } from '@/features/deputies/deputy-search'
import { GroupLabel } from '@/features/groups/group-label'
import {
  latestSenateGroupIdOf,
  senateGroupsById,
  senatorFullNameOf,
  senatorLeftOfficeOn
} from '@/features/senators/senator'
import { filterSenators } from '@/features/senators/senator-search'
import type { SenateDirectory } from '@/features/senators/senators-api'
import { dateOfDay } from '@/infrastructure/dates'
import {
  senatorPathFor,
  useSearchValue
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { FilterBar } from '@/presentation/components/filter-bar'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { Link } from '@/presentation/components/ui/link'
import { SearchField } from '@/presentation/components/ui/search-field'
import { Select, SelectItem } from '@/presentation/components/ui/select'
import {
  filterValueOf,
  selectedKeyOf
} from '@/presentation/components/ui/select-all-key'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { DocumentTitle } from '@/presentation/head/document-title'
import { documentTitleFor } from '@/presentation/head/page-heads'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useSenatorsData } from './senators-loader'

import './senators-page.sass'

const SENATORS_PER_PAGE = 60

type SenatorLineProps = {
  /** Today's group, or the last one of a senator who left. */
  group: SenateGroup | null
  senator: Senator
}

const SenatorLine: React.FC<SenatorLineProps> = ({ group, senator }) => {
  const translate = useTranslate()
  const leftOn = senatorLeftOfficeOn(senator)

  return (
    <div className='senator-line'>
      <Link className='senator-line-name' href={senatorPathFor(senator.id)}>
        {senatorFullNameOf(senator)}
      </Link>
      <GroupLabel group={group} />
      <span className='senator-line-seat'>{senator.constituency.name}</span>
      {leftOn !== null && (
        <span className='senator-line-left'>
          {translate('deputy.leftOffice', { to: dateOfDay(leftOn) })}
        </span>
      )}
    </div>
  )
}

const SenateDirectoryList: React.FC<{ directory: SenateDirectory }> = ({
  directory
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useSearchValue('query')
  const [groupId, setGroupId] = useSearchValue('group')
  const [scopeValue, setScope] = useSearchValue('scope')
  const filters = {
    groupId,
    query: query ?? '',
    scope: parseDeputyScope(scopeValue)
  }
  const senators = filterSenators({
    filters,
    senators: directory.senators
  }).toSorted(compareDeputyNames)
  const groupById = senateGroupsById(directory.groups)
  const groupOf = (senator: Senator): SenateGroup | null => {
    const latestGroupId = latestSenateGroupIdOf(senator)

    return latestGroupId === null
      ? null
      : (groupById.get(latestGroupId) ?? null)
  }

  return (
    <>
      <FilterBar legend={translate('senators.filtersLegend')}>
        <SearchField
          label={translate('deputies.search')}
          onChange={setQuery}
          value={query ?? ''}
        />
        <Select
          label={translate('deputies.group')}
          onChange={(key) => setGroupId(filterValueOf(key))}
          value={selectedKeyOf(groupId)}
        >
          <SelectItem id={selectedKeyOf(null)}>
            {translate('deputies.allGroups')}
          </SelectItem>
          {directory.groups.map((group) => (
            <SelectItem id={group.id} key={group.id} textValue={group.name}>
              <GroupLabel group={group} length='full' />
            </SelectItem>
          ))}
        </Select>
        <ToggleButtonGroup
          aria-label={translate('deputies.scope.label')}
          className='scope-tabs'
          onSelectionChange={(keys) => {
            setScope(keys.has('all') ? 'all' : null)
          }}
          selectedKeys={[filters.scope]}
        >
          <ToggleButton id='sitting'>
            {translate('deputies.scope.sitting')}
          </ToggleButton>
          <ToggleButton id='all'>
            {translate('deputies.scope.all')}
          </ToggleButton>
        </ToggleButtonGroup>
      </FilterBar>
      <RecordCard
        heading={translate('senators.resultCount', { count: senators.length })}
      >
        {senators.length === 0 ? (
          <p className='record-note'>{translate('senators.empty')}</p>
        ) : (
          <ProgressiveList
            items={senators}
            key={JSON.stringify(filters)}
            keyOf={(senator) => senator.id}
            pageSize={SENATORS_PER_PAGE}
            renderItem={(senator) => (
              <SenatorLine group={groupOf(senator)} senator={senator} />
            )}
          />
        )}
      </RecordCard>
    </>
  )
}

const DirectoryOrFailure: React.FC = () => {
  const { directory } = useSenatorsData()
  const result = use(directory)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <SenateDirectoryList directory={result.data} />
  )
}

export const SenatorsPage: React.FC = () => {
  const translate = useTranslate()

  return (
    <Main className='senators-page'>
      <DocumentTitle>
        {documentTitleFor(translate('senators.title'))}
      </DocumentTitle>
      <PageIntro
        lead={translate('senators.lead')}
        title={translate('senators.title')}
      />
      <Suspense fallback={<LoadingLines lines={8} />}>
        <DirectoryOrFailure />
      </Suspense>
    </Main>
  )
}
