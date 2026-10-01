import type React from 'react'
import { Suspense, use } from 'react'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import {
  fullNameOf,
  latestGroupIdOf,
  leftOfficeOn
} from '@/features/deputies/deputy'
import {
  departmentsOf,
  filterDeputies,
  parseDeputyScope
} from '@/features/deputies/deputy-search'
import type { Directory } from '@/features/deputies/directory-api'
import { GroupLabel } from '@/features/groups/group-label'
import { groupsById } from '@/features/groups/group-members'
import { dateOfDay } from '@/helpers/iso-day'
import {
  deputyPathFor,
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
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { useDeputiesData } from './deputies-loader'

import './deputies-page.sass'

const DEPUTIES_PER_PAGE = 60

type DeputyLineProps = {
  deputy: Deputy
  /** Today's group, or the last one of a deputy who left. */
  group: Group | null
}

const DeputyLine: React.FC<DeputyLineProps> = ({ deputy, group }) => {
  const translate = useTranslate()
  const leftOn = leftOfficeOn(deputy)

  return (
    <div className='deputy-line'>
      <Link className='deputy-line-name' href={deputyPathFor(deputy.id)}>
        {fullNameOf(deputy)}
      </Link>
      <GroupLabel group={group} />
      <span className='deputy-line-seat'>
        {translate('deputy.constituency', {
          department: deputy.department.name,
          number: deputy.constituency
        })}
      </span>
      {leftOn !== null && (
        <span className='deputy-line-left'>
          {translate('deputy.leftOffice', { to: dateOfDay(leftOn) })}
        </span>
      )}
    </div>
  )
}

const DeputyDirectory: React.FC<{ directory: Directory }> = ({ directory }) => {
  const translate = useTranslate()
  const [query, setQuery] = useSearchValue('query')
  const [groupId, setGroupId] = useSearchValue('group')
  const [departmentCode, setDepartmentCode] = useSearchValue('department')
  const [scopeValue, setScope] = useSearchValue('scope')
  const scope = parseDeputyScope(scopeValue)
  const filters = { departmentCode, groupId, query: query ?? '', scope }
  const deputies = filterDeputies({
    deputies: directory.deputies,
    filters
  }).toSorted((first, second) =>
    `${first.lastName} ${first.firstName}`.localeCompare(
      `${second.lastName} ${second.firstName}`,
      'fr'
    )
  )
  const groupById = groupsById(directory.groups)
  const groupOf = (deputy: Deputy): Group | null => {
    const groupId = latestGroupIdOf(deputy)

    return groupId === null ? null : (groupById.get(groupId) ?? null)
  }
  const groups = directory.groups.filter(
    (group) => scope === 'all' || group.to === null
  )

  return (
    <>
      <FilterBar legend={translate('deputies.filtersLegend')}>
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
          {groups.map((group) => (
            <SelectItem id={group.id} key={group.id} textValue={group.name}>
              <GroupLabel group={group} length='full' />
            </SelectItem>
          ))}
        </Select>
        <Select
          label={translate('deputies.department')}
          onChange={(key) => setDepartmentCode(filterValueOf(key))}
          value={selectedKeyOf(departmentCode)}
        >
          <SelectItem id={selectedKeyOf(null)}>
            {translate('deputies.allDepartments')}
          </SelectItem>
          {departmentsOf(directory.deputies).map((department) => (
            <SelectItem
              id={department.code}
              key={department.code}
              textValue={department.name}
            >
              {`${department.code} · ${department.name}`}
            </SelectItem>
          ))}
        </Select>
        <ToggleButtonGroup
          aria-label={translate('deputies.scope.label')}
          className='scope-tabs'
          onSelectionChange={(keys) => {
            setScope(keys.has('all') ? 'all' : null)
          }}
          selectedKeys={[scope]}
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
        heading={translate('deputies.resultCount', { count: deputies.length })}
      >
        {deputies.length === 0 ? (
          <p className='record-note'>{translate('deputies.empty')}</p>
        ) : (
          <ProgressiveList
            items={deputies}
            key={JSON.stringify(filters)}
            keyOf={(deputy) => deputy.id}
            pageSize={DEPUTIES_PER_PAGE}
            renderItem={(deputy) => (
              <DeputyLine deputy={deputy} group={groupOf(deputy)} />
            )}
          />
        )}
      </RecordCard>
    </>
  )
}

const DirectoryOrFailure: React.FC = () => {
  const { directory } = useDeputiesData()
  const result = use(directory)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <DeputyDirectory directory={result.data} />
  )
}

export const DeputiesPage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('deputies.title'))

  return (
    <Main className='deputies-page'>
      <PageIntro
        lead={translate('deputies.lead')}
        title={translate('deputies.title')}
      />
      <Suspense fallback={<LoadingLines lines={8} />}>
        <DirectoryOrFailure />
      </Suspense>
    </Main>
  )
}
