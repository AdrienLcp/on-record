import type React from 'react'
import { useState } from 'react'

import type { SenateScrutinDetail } from '@on-record/protocol/senate/senate-scrutin'

import { GroupLabel } from '@/features/groups/group-label'
import { NominalEntry } from '@/features/scrutins/nominal-entry'
import {
  isNominalPositionFilter,
  NOMINAL_POSITION_FILTERS,
  type NominalPositionFilter
} from '@/features/scrutins/nominal-position-filter'
import { senatorPathFor } from '@/infrastructure/router/navigation'
import { FilterBar } from '@/presentation/components/filter-bar'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { SearchField } from '@/presentation/components/ui/search-field'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  filterSenateNominalLines,
  senateNominalLinesOf,
  senateNominalNameOf
} from './senate-nominal-lines'
import type { SenateScrutinContext } from './senate-scrutin-loader'

const LINES_PER_PAGE = 100

type SenateNominalListProps = {
  context: SenateScrutinContext
  scrutin: SenateScrutinDetail
}

/** Every recorded ballot, searchable by name, with each senator's group of the day. */
export const SenateNominalList: React.FC<SenateNominalListProps> = ({
  context,
  scrutin
}) => {
  const translate = useTranslate()
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<NominalPositionFilter>('all')
  const lines = filterSenateNominalLines({
    lines: senateNominalLinesOf({
      scrutin,
      senatorsById: context.senatorsById
    }),
    position,
    query
  })

  return (
    <RecordCard
      className='nominal-list'
      heading={translate('scrutin.nominal.title')}
      reference={translate('senateScrutin.nominal.count', {
        count: lines.length
      })}
    >
      <p className='record-note'>{translate('senateScrutin.nominal.lead')}</p>
      <FilterBar legend={translate('scrutin.nominal.filtersLegend')}>
        <SearchField
          label={translate('senateScrutin.nominal.search')}
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
      {lines.length === 0 ? (
        <p className='record-note'>
          {translate('senateScrutin.nominal.empty')}
        </p>
      ) : (
        <ProgressiveList
          items={lines}
          key={`${position}-${query}`}
          keyOf={(line) => line.ballot.senatorId}
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
              href={senatorPathFor(line.ballot.senatorId)}
              name={senateNominalNameOf(line)}
              position={line.ballot.position}
            />
          )}
        />
      )}
    </RecordCard>
  )
}
