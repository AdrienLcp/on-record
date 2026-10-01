import type React from 'react'
import { useState } from 'react'

import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf } from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { BallotMark } from '@/features/scrutins/ballot-mark'
import { deputyPathFor } from '@/infrastructure/router/navigation'
import { FilterBar } from '@/presentation/components/filter-bar'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { SearchField } from '@/presentation/components/ui/search-field'
import { TextLink } from '@/presentation/components/ui/text-link'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  filterNominalLines,
  NOMINAL_POSITION_FILTERS,
  type NominalLine,
  type NominalPositionFilter,
  nominalLinesOf
} from './scrutin-breakdown'
import type { ScrutinContext } from './scrutin-loader'

import './nominal-list.sass'

const LINES_PER_PAGE = 100

const NominalEntry: React.FC<{
  context: ScrutinContext
  line: NominalLine
}> = ({ context, line }) => {
  const translate = useTranslate()

  return (
    <div className='nominal-entry'>
      <TextLink
        className='nominal-name'
        href={deputyPathFor(line.ballot.deputyId)}
      >
        {line.deputy === null ? line.ballot.deputyId : fullNameOf(line.deputy)}
      </TextLink>
      <GroupLabel group={context.groupById.get(line.groupId) ?? null} />
      <span className='nominal-ballot'>
        <BallotMark position={line.ballot.position} />
        {line.ballot.byDelegation && (
          <span className='nominal-aside'>
            {translate('ballot.byDelegation')}
          </span>
        )}
      </span>
      {line.correction !== null && (
        <span className='nominal-correction'>
          {translate('ballot.correction', { intended: line.correction })}
        </span>
      )}
    </div>
  )
}

const isNominalPositionFilter = (key: unknown): key is NominalPositionFilter =>
  NOMINAL_POSITION_FILTERS.some((filter) => filter === key)

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
  const lines = filterNominalLines({
    lines: nominalLinesOf({ deputiesById: context.deputiesById, scrutin }),
    position,
    query
  })

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
      {lines.length === 0 ? (
        <p className='record-note'>{translate('scrutin.nominal.empty')}</p>
      ) : (
        <ProgressiveList
          items={lines}
          key={`${position}-${query}`}
          keyOf={(line) => line.ballot.deputyId}
          pageSize={LINES_PER_PAGE}
          renderItem={(line) => <NominalEntry context={context} line={line} />}
        />
      )}
    </RecordCard>
  )
}
