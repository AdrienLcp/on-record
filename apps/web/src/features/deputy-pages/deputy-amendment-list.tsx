import type { Result } from '@adrienlcp/result'
import type React from 'react'
import { use } from 'react'

import {
  filterAmendmentLines,
  outcomeCountsOf,
  parseOutcomeFilter,
  parseStageFilter,
  STAGE_FILTERS
} from '@/features/amendments/amendment-search'
import { TabledAmendmentLine } from '@/features/amendments/tabled-amendment-line'
import type { DatasetError } from '@/infrastructure/api/datasets-api'
import {
  AMENDMENTS_FRAGMENT,
  useSearchValue
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { FilterBar } from '@/presentation/components/filter-bar'
import { ProgressiveList } from '@/presentation/components/progressive-list'
import { RecordCard } from '@/presentation/components/record-card'
import { Select, SelectItem } from '@/presentation/components/ui/select'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { DeputyAmendmentRecord } from './deputy-loader'

import './deputy-amendment-list.sass'

const LINES_PER_PAGE = 20

/** The outcomes a reader meets without a vote behind them, explained in plain words. */
const GLOSSED_OUTCOMES = [
  'withdrawn',
  'fell',
  'notMoved',
  'inadmissible',
  'pending'
] as const

const OutcomeGlossary: React.FC = () => {
  const translate = useTranslate()

  return (
    <details className='amendment-glossary'>
      <summary>{translate('amendments.glossary.title')}</summary>
      <div className='glossary-body'>
        <dl>
          {GLOSSED_OUTCOMES.map((outcome) => (
            <div className='glossary-entry' key={outcome}>
              <dt>{translate(`outcome.${outcome}`)}</dt>
              <dd>{translate(`amendments.glossary.${outcome}`)}</dd>
            </div>
          ))}
        </dl>
        <p className='record-note'>{translate('amendments.glossary.stages')}</p>
        <p className='record-note'>{translate('amendments.glossary.noRate')}</p>
      </div>
    </details>
  )
}

const AmendmentRegister: React.FC<{ record: DeputyAmendmentRecord }> = ({
  record
}) => {
  const translate = useTranslate()
  const [stageValue, setStage] = useSearchValue('amendmentStage')
  const [outcomeValue, setOutcome] = useSearchValue('amendmentOutcome')
  const filters = {
    outcome: parseOutcomeFilter(outcomeValue),
    stage: parseStageFilter(stageValue)
  }
  const shown = filterAmendmentLines({ filters, lines: record.lines })

  return (
    <RecordCard
      heading={translate('amendments.title')}
      reference={translate('amendments.count', { count: shown.length })}
    >
      <p className='record-note'>{translate('amendments.lead')}</p>
      <p className='amendment-cosigned'>
        <span className='cosigned-count'>
          {translate('amendments.cosigned', { count: record.cosignedCount })}
        </span>{' '}
        <span className='record-note'>
          {translate('amendments.cosignedContext')}
        </span>
      </p>
      {record.lines.length === 0 ? (
        <p className='record-note'>{translate('amendments.empty')}</p>
      ) : (
        <>
          <FilterBar legend={translate('amendments.filtersLegend')}>
            <ToggleButtonGroup
              aria-label={translate('amendments.stageTabs.label')}
              onSelectionChange={(keys) => {
                const [stage] = keys
                setStage(
                  stage === 'all' || typeof stage !== 'string' ? null : stage
                )
              }}
              selectedKeys={[filters.stage]}
            >
              {STAGE_FILTERS.map((stage) => (
                <ToggleButton id={stage} key={stage}>
                  {translate(`amendments.stageTabs.${stage}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Select
              label={translate('amendments.outcomeFilter')}
              onChange={(key) => {
                setOutcome(
                  key === 'all' || typeof key !== 'string' ? null : key
                )
              }}
              value={filters.outcome}
            >
              {outcomeCountsOf({
                lines: record.lines,
                stage: filters.stage
              }).map(({ count, outcome }) => (
                <SelectItem id={outcome} key={outcome}>
                  {translate('amendments.outcomeOption', {
                    count,
                    label: translate(`amendments.outcomes.${outcome}`)
                  })}
                </SelectItem>
              ))}
            </Select>
          </FilterBar>
          <OutcomeGlossary />
          {shown.length === 0 ? (
            <p className='record-note'>{translate('amendments.emptyFilter')}</p>
          ) : (
            <ProgressiveList
              items={shown}
              key={`${filters.stage}-${filters.outcome}`}
              keyOf={(line) => `${line.organ}-${line.number}`}
              pageSize={LINES_PER_PAGE}
              renderItem={(line) => (
                <TabledAmendmentLine
                  legislature={record.legislature}
                  line={line}
                />
              )}
            />
          )}
        </>
      )}
    </RecordCard>
  )
}

type DeputyAmendmentListProps = {
  amendments: Promise<Result<DeputyAmendmentRecord, DatasetError>>
}

/** The amendments the deputy tabled, filtered from the URL like the votes above. */
export const DeputyAmendmentList: React.FC<DeputyAmendmentListProps> = ({
  amendments
}) => {
  const record = use(amendments)

  return (
    <div className='deputy-amendment-list' id={AMENDMENTS_FRAGMENT}>
      {record.status === 'failure' ? (
        <DatasetFailure error={record.error} />
      ) : (
        <AmendmentRegister record={record.data} />
      )}
    </div>
  )
}
