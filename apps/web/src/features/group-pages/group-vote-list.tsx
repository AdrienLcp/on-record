import type React from 'react'

import { BallotMark } from '@/features/scrutins/ballot-mark'
import { ScrutinLine } from '@/features/scrutins/scrutin-line'
import { KIND_FILTERS } from '@/features/scrutins/scrutin-search'
import { VoteBar } from '@/features/scrutins/vote-bar'
import {
  useSearchValue,
  VOTES_FRAGMENT
} from '@/infrastructure/router/navigation'
import { FilterBar } from '@/presentation/components/filter-bar'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { Select, SelectItem } from '@/presentation/components/ui/select'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import {
  filterGroupLines,
  type GroupVoteLine,
  groupKindSearchValue,
  POSITION_FILTERS,
  parseGroupKindFilter,
  parsePositionFilter,
  withoutVoteCountOf
} from './group-votes'

import './group-vote-list.sass'

const LINES_PER_PAGE = 25

/** The group's published position, and the bar of its members' votes that day. */
const GroupScrutinVote: React.FC<{ line: GroupVoteLine }> = ({ line }) => {
  const translate = useTranslate()
  const { scrutin, vote } = line

  if (scrutin.kind === 'censure') {
    return (
      <div className='group-scrutin-vote'>
        <VoteBar base={vote.memberCount} totals={vote.totals} />
        <p className='group-scrutin-counts'>
          {translate('group.votes.censureCount', {
            count: vote.totals.for,
            members: vote.memberCount
          })}
        </p>
      </div>
    )
  }

  return (
    <div className='group-scrutin-vote'>
      <p className='group-scrutin-position'>
        <span>{translate('group.votes.position')}</span>
        {vote.position === null ? (
          <span className='group-scrutin-aside'>
            {translate('deputy.votes.groupNoMajority')}
          </span>
        ) : (
          <BallotMark position={vote.position} />
        )}
      </p>
      <VoteBar base={vote.memberCount} totals={vote.totals} />
      <p className='group-scrutin-counts'>
        {translate('scrutin.totals.vote', vote.totals)} ·{' '}
        {translate('scrutin.groups.withoutVote', {
          count: withoutVoteCountOf(vote)
        })}
      </p>
    </div>
  )
}

/** The group's scrutins, filtered from the URL so every count above can link here. */
export const GroupVoteList: React.FC<{ lines: readonly GroupVoteLine[] }> = ({
  lines
}) => {
  const translate = useTranslate()
  const [kindValue, setKind] = useSearchValue('kind')
  const [positionValue, setPosition] = useSearchValue('ballot')
  const filters = {
    kind: parseGroupKindFilter(kindValue),
    position: parsePositionFilter(positionValue)
  }
  const shown = filterGroupLines({ filters, lines })

  return (
    <div className='group-vote-list' id={VOTES_FRAGMENT}>
      <RecordCard
        heading={translate('group.votes.title')}
        reference={translate('deputy.votes.count', { count: shown.length })}
      >
        <FilterBar legend={translate('group.votes.filtersLegend')}>
          <ToggleButtonGroup
            aria-label={translate('scrutins.kind')}
            className='kind-tabs'
            onSelectionChange={(keys) => {
              const [kind] = keys
              const selected = KIND_FILTERS.find((filter) => filter === kind)
              if (selected !== undefined) {
                setKind(groupKindSearchValue(selected) ?? null)
              }
            }}
            selectedKeys={[filters.kind]}
          >
            {KIND_FILTERS.map((kind) => (
              <ToggleButton id={kind} key={kind}>
                {translate(`scrutins.kindTabs.${kind}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Select
            label={translate('group.votes.positionFilter')}
            onChange={(key) => {
              setPosition(key === 'all' || typeof key !== 'string' ? null : key)
            }}
            value={filters.position}
          >
            {POSITION_FILTERS.map((position) => (
              <SelectItem id={position} key={position}>
                {translate(`group.votes.positions.${position}`)}
              </SelectItem>
            ))}
          </Select>
        </FilterBar>
        {shown.length === 0 ? (
          <p className='record-note'>{translate('deputy.votes.empty')}</p>
        ) : (
          <ProgressiveList
            items={shown}
            key={`${filters.kind}-${filters.position}`}
            keyOf={(line) => line.scrutin.number}
            pageSize={LINES_PER_PAGE}
            renderItem={(line) => (
              <ScrutinLine scrutin={line.scrutin}>
                <GroupScrutinVote line={line} />
              </ScrutinLine>
            )}
          />
        )}
      </RecordCard>
    </div>
  )
}
