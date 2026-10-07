import type React from 'react'

import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type { SenateGroupId } from '@on-record/protocol/senate/senate-ids'

import { GroupLabel } from '@/features/groups/group-label'
import { BallotBesideGroup } from '@/features/scrutins/ballot-beside-group'
import { SenateScrutinLine } from '@/features/senate-scrutins/senate-scrutin-line'
import {
  parseSenateKindFilter,
  SENATE_KIND_FILTERS
} from '@/features/senate-scrutins/senate-scrutin-search'
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
  filterSenatorVoteLines,
  parseSenatorBallotFilter,
  SENATOR_BALLOT_FILTERS,
  type SenatorVoteLine
} from './senator-votes'

const LINES_PER_PAGE = 25

type SenatorVoteListProps = {
  groupById: ReadonlyMap<SenateGroupId, SenateGroup>
  lines: readonly SenatorVoteLine[]
}

/** The senator's scrutins, filtered from the URL so a link elsewhere can open it filtered. */
export const SenatorVoteList: React.FC<SenatorVoteListProps> = ({
  groupById,
  lines
}) => {
  const translate = useTranslate()
  const [kindValue, setKind] = useSearchValue('kind')
  const [ballotValue, setBallot] = useSearchValue('ballot')
  const filters = {
    ballot: parseSenatorBallotFilter(ballotValue),
    kind: parseSenateKindFilter(kindValue)
  }
  const shown = filterSenatorVoteLines({ filters, lines })

  return (
    <div className='senator-vote-list' id={VOTES_FRAGMENT}>
      <RecordCard
        heading={translate('deputy.votes.title')}
        reference={translate('deputy.votes.count', { count: shown.length })}
      >
        <p className='record-note'>
          {translate('senator.votes.noParticipation')}
        </p>
        {lines.length === 0 ? (
          <p className='record-note'>{translate('senator.votes.none')}</p>
        ) : (
          <>
            <FilterBar legend={translate('deputy.votes.filtersLegend')}>
              <ToggleButtonGroup
                aria-label={translate('scrutins.kind')}
                className='kind-tabs'
                onSelectionChange={(keys) => {
                  const [kind] = keys
                  setKind(
                    kind === 'all' || typeof kind !== 'string' ? null : kind
                  )
                }}
                selectedKeys={[filters.kind]}
              >
                {SENATE_KIND_FILTERS.map((kind) => (
                  <ToggleButton id={kind} key={kind}>
                    {translate(`scrutins.kindTabs.${kind}`)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Select
                label={translate('deputy.votes.ballotFilter')}
                onChange={(key) => {
                  setBallot(
                    key === 'all' || typeof key !== 'string' ? null : key
                  )
                }}
                value={filters.ballot}
              >
                {SENATOR_BALLOT_FILTERS.map((ballotFilter) => (
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
                keyOf={(line) => line.scrutin.id}
                pageSize={LINES_PER_PAGE}
                renderItem={(line) => (
                  <SenateScrutinLine scrutin={line.scrutin}>
                    <BallotBesideGroup
                      byDelegation={line.ballot.byDelegation}
                      correction={line.ballot.correction}
                      group={
                        <GroupLabel
                          group={
                            line.groupId === null
                              ? null
                              : (groupById.get(line.groupId) ?? null)
                          }
                        />
                      }
                      groupPosition={line.ballot.groupPosition}
                      position={line.ballot.position}
                    />
                  </SenateScrutinLine>
                )}
              />
            )}
          </>
        )}
      </RecordCard>
    </div>
  )
}
