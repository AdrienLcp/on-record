import type React from 'react'
import { useState } from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf } from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { usePartySelection } from '@/features/parties/use-party-selection'
import { NominalEntry } from '@/features/scrutins/nominal-entry'
import {
  isNominalPositionFilter,
  NOMINAL_POSITION_FILTERS,
  type NominalPositionFilter
} from '@/features/scrutins/nominal-position-filter'
import { deputyPathFor } from '@/infrastructure/router/navigation'
import { FilterBar } from '@/presentation/components/filter-bar'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { Button } from '@/presentation/components/ui/button'
import { SearchField } from '@/presentation/components/ui/search-field'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { filterNominalLines, nominalLinesOf } from './scrutin-breakdown'
import type { ScrutinContext } from './scrutin-loader'

import './nominal-list.sass'

const LINES_PER_PAGE = 100

type NominalListProps = {
  context: ScrutinContext
  scrutin: ScrutinDetail
}

/** Every recorded vote, searchable by name, with each deputy's group of the day. */
export const NominalList: React.FC<NominalListProps> = ({
  context,
  scrutin
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<NominalPositionFilter>('all')
  const parties = usePartySelection()
  const lines = filterNominalLines({
    lines: nominalLinesOf({ deputiesById: context.deputiesById, scrutin }),
    position,
    query
  }).filter((line) => parties.showsGroup(line.groupId))
  const isEmptyForParties = parties.isFiltered && query === ''

  return (
    <RecordCard
      className='nominal-list'
      heading={translate('scrutin.nominal.title')}
      reference={translate('scrutin.nominal.count', { count: lines.length })}
    >
      <p className='record-note'>{translate('scrutin.nominal.lead')}</p>
      <FilterBar legend={translate('scrutin.nominal.filtersLegend')}>
        <SearchField
          label={translate('scrutin.nominal.search')}
          onChange={setQuery}
          value={query}
        />
        <ToggleButtonGroup
          aria-label={translate('scrutin.nominal.positionFilter')}
          className='position-tabs'
          onSelectionChange={(keys) => {
            const [chosen] = keys

            if (isNominalPositionFilter(chosen)) {
              setPosition(chosen)
            }
          }}
          selectedKeys={[position]}
        >
          {NOMINAL_POSITION_FILTERS.map((filter) => (
            <ToggleButton id={filter} key={filter}>
              {translate(`scrutin.nominal.positions.${filter}`)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </FilterBar>
      {lines.length === 0 && isEmptyForParties && (
        <div className='nominal-empty'>
          <p className='record-note'>
            {translate('scrutin.nominal.emptyForParties', { position })}
          </p>
          <Button className='inline-action' onPress={() => parties.choose([])}>
            {translate('party.showAllGroups')}
          </Button>
        </div>
      )}
      {lines.length === 0 && !isEmptyForParties && (
        <p className='record-note'>{translate('scrutin.nominal.empty')}</p>
      )}
      {lines.length > 0 && (
        <ProgressiveList
          items={lines}
          key={`${position}-${query}-${parties.choices.join()}`}
          keyOf={(line) => line.ballot.deputyId}
          pageSize={LINES_PER_PAGE}
          renderItem={(line) => (
            <NominalEntry
              byDelegation={line.ballot.byDelegation}
              correction={line.correction}
              group={
                <GroupLabel
                  group={context.groupById.get(line.groupId) ?? null}
                />
              }
              href={deputyPathFor(line.ballot.deputyId)}
              name={
                line.deputy === null
                  ? line.ballot.deputyId
                  : fullNameOf(line.deputy)
              }
              position={line.ballot.position}
            />
          )}
        />
      )}
    </RecordCard>
  )
}
