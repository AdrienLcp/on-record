import type React from 'react'

import type { Group } from '@on-record/protocol/assembly/group'
import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import { GroupLabel } from '@/features/groups/group-label'
import { BallotMark } from '@/features/scrutins/ballot-mark'
import { ScrutinLine } from '@/features/scrutins/scrutin-line'
import {
  KIND_FILTERS,
  parseKindFilter
} from '@/features/scrutins/scrutin-search'
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
  BALLOT_FILTERS,
  type DeputyVoteLine,
  filterVoteLines,
  parseBallotFilter
} from './deputy-votes'

import './deputy-vote-list.sass'

const LINES_PER_PAGE = 25

type VoteLineProps = {
  group: Group | null
  line: DeputyVoteLine
}

/** The deputy's own vote beside their group's majority of that day. */
const DeputyBallot: React.FC<VoteLineProps> = ({ group, line }) => {
  const translate = useTranslate()
  const { ballot } = line

  if (ballot === null) {
    return (
      <p className='deputy-ballot not-recorded'>
        {translate('deputy.votes.notRecorded')}
      </p>
    )
  }

  return (
    <dl className='deputy-ballot'>
      <div className='ballot-row'>
        <dt>{translate('deputy.votes.ownVote')}</dt>
        <dd>
          <BallotMark position={ballot.position} />
          {ballot.byDelegation && (
            <span className='ballot-aside'>
              {translate('ballot.byDelegation')}
            </span>
          )}
        </dd>
      </div>
      {ballot.correction !== null && (
        <div className='ballot-row correction'>
          <dt className='correction-flag'>
            {translate('ballot.correction', { intended: ballot.correction })}
          </dt>
          <dd>
            <BallotMark position={ballot.correction} withLabel={false} />
          </dd>
        </div>
      )}
      <div className='ballot-row'>
        <dt>
          {translate('deputy.votes.groupMajority')} <GroupLabel group={group} />
        </dt>
        <dd>
          {ballot.groupPosition === null ? (
            <span className='ballot-aside'>
              {translate('deputy.votes.groupNoMajority')}
            </span>
          ) : (
            <BallotMark position={ballot.groupPosition} />
          )}
        </dd>
      </div>
    </dl>
  )
}

type DeputyVoteListProps = {
  groupById: ReadonlyMap<OrganId, Group>
  lines: readonly DeputyVoteLine[]
}

/** The deputy's scrutins, filtered from the URL so every figure can link here. */
export const DeputyVoteList: React.FC<DeputyVoteListProps> = ({
  groupById,
  lines
}) => {
  const translate = useTranslate()
  const [kindValue, setKind] = useSearchValue('kind')
  const [ballotValue, setBallot] = useSearchValue('ballot')
  const filters = {
    ballot: parseBallotFilter(ballotValue),
    kind: parseKindFilter(kindValue)
  }
  const shown = filterVoteLines({ filters, lines })

  return (
    <div className='deputy-vote-list' id={VOTES_FRAGMENT}>
      <RecordCard
        heading={translate('deputy.votes.title')}
        reference={translate('deputy.votes.count', { count: shown.length })}
      >
        <FilterBar legend={translate('deputy.votes.filtersLegend')}>
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
          <Select
            label={translate('deputy.votes.ballotFilter')}
            onChange={(key) => {
              setBallot(key === 'all' || typeof key !== 'string' ? null : key)
            }}
            value={filters.ballot}
          >
            {BALLOT_FILTERS.map((ballotFilter) => (
              <SelectItem id={ballotFilter} key={ballotFilter}>
                {translate(`deputy.votes.ballots.${ballotFilter}`)}
              </SelectItem>
            ))}
          </Select>
        </FilterBar>
        {shown.length === 0 ? (
          <p className='record-note'>{translate('deputy.votes.empty')}</p>
        ) : (
          <ProgressiveList
            items={shown}
            key={`${filters.kind}-${filters.ballot}`}
            keyOf={(line) => line.scrutin.number}
            pageSize={LINES_PER_PAGE}
            renderItem={(line) => (
              <ScrutinLine scrutin={line.scrutin}>
                <DeputyBallot
                  group={
                    line.groupId === null
                      ? null
                      : (groupById.get(line.groupId) ?? null)
                  }
                  line={line}
                />
              </ScrutinLine>
            )}
          />
        )}
      </RecordCard>
    </div>
  )
}
