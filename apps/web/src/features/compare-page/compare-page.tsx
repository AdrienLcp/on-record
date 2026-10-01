import type React from 'react'
import { Suspense, use } from 'react'

import { usePartySelection } from '@/features/parties/use-party-selection'
import {
  groupPathFor,
  useSearchValue
} from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { SearchField } from '@/presentation/components/ui/search-field'
import { TextLink } from '@/presentation/components/ui/text-link'
import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import { AgreementDigest } from './agreement-digest'
import { CampList } from './camp-list'
import { type Comparison, useCompareData } from './compare-loader'
import { ComparedPartiesField } from './compared-parties-field'
import {
  type Agreement,
  agreementSearchValue,
  COMPARED_KINDS,
  COMPARED_VIEWS,
  type ComparedParty,
  type ComparedView,
  comparedKindSearchValue,
  comparedPartiesOf,
  comparedViewSearchValue,
  compareVotes,
  countVotesOfKind,
  parseAgreement,
  parseComparedKind,
  parseComparedView
} from './party-comparison'
import { VoteLedger } from './vote-ledger'

import './compare-page.sass'

/** One party chosen: nothing to set beside it, but its group's page has every vote. */
const NothingToCompare: React.FC<{ compared: ComparedParty }> = ({
  compared
}) => {
  const translate = useTranslate()

  return (
    <RecordCard heading={translate('compare.onlyOne.title')}>
      <p className='compare-only-one'>
        <RichText
          parts={translate.rich('compare.onlyOne.text', {
            acronym:
              compared.group?.shortName ??
              translate(`party.names.${compared.party.id}`),
            group: (children) => (
              <TextLink href={groupPathFor(compared.party.groupId)} key='group'>
                {children}
              </TextLink>
            ),
            party: translate(`party.names.${compared.party.id}`),
            strong: (children) => <strong key='strong'>{children}</strong>
          })}
        />
      </p>
    </RecordCard>
  )
}

/** What an empty list says, by what emptied it. */
const EMPTY_LIST_KEYS = {
  all: 'compare.empty.noMatch',
  split: 'compare.empty.noSplit',
  together: 'compare.empty.noTogether'
} as const satisfies Record<Agreement, string>

const ComparisonView: React.FC<{
  comparison: Comparison
  view: ComparedView
}> = ({ comparison, view }) => {
  const translate = useTranslate()
  const parties = usePartySelection()
  const [kindValue, setKind] = useSearchValue('kind')
  const [agreementValue, setAgreementValue] = useSearchValue('agreement')
  const [query, setQuery] = useSearchValue('query')
  const parsedAgreement = parseAgreement(agreementValue)
  const filters = {
    // The ledger only offers the splits: a link to the agreements opens on every vote.
    agreement:
      view === 'ledger' && parsedAgreement === 'together'
        ? 'all'
        : parsedAgreement,
    kind: parseComparedKind(kindValue),
    query: query ?? ''
  } as const
  const setAgreement = (agreement: Agreement) =>
    setAgreementValue(agreementSearchValue(agreement))
  const compared: ComparedParty[] = comparedPartiesOf(parties.choices).map(
    (party) => ({
      group: comparison.groups.find((group) => group.id === party.groupId),
      party
    })
  )
  const { matching, shown, split, together } = compareVotes({
    filters,
    groupIds: compared.map((each) => each.party.groupId),
    votes: comparison.votes
  })
  const [onlyCompared] = compared

  return (
    <>
      <ComparedPartiesField groups={comparison.groups} selection={parties} />
      <SearchField
        className='compare-search'
        label={translate('compare.search')}
        onChange={setQuery}
        value={query ?? ''}
      />
      {compared.length === 1 && onlyCompared !== undefined ? (
        <NothingToCompare compared={onlyCompared} />
      ) : (
        <>
          {view === 'camps' && matching.length > 0 && (
            <AgreementDigest
              agreement={filters.agreement}
              kind={filters.kind}
              onAgreementChange={setAgreement}
              parties={compared}
              splitCount={split.length}
              togetherCount={together.length}
            />
          )}
          <div className='compare-register'>
            <ToggleButtonGroup
              aria-label={translate('compare.kindsLabel')}
              onSelectionChange={(keys) => {
                const [key] = keys
                const kind = COMPARED_KINDS.find((each) => each === key)
                if (kind !== undefined) {
                  setKind(comparedKindSearchValue(kind))
                }
              }}
              selectedKeys={[filters.kind]}
            >
              {COMPARED_KINDS.map((kind) => (
                <ToggleButton id={kind} key={kind}>
                  {translate(`compare.kinds.${kind}`)}
                  <span className='tab-count'>
                    {countVotesOfKind({ kind, votes: comparison.votes })}
                  </span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <RecordCard
              className='compare-card'
              heading={translate(
                `compare.heading.${filters.kind}.${filters.agreement}`
              )}
              reference={translate('common.countOf', {
                shown: shown.length,
                total: matching.length
              })}
            >
              {view === 'ledger' && (
                <label className='compare-split'>
                  <input
                    checked={filters.agreement === 'split'}
                    onChange={(event) =>
                      setAgreement(event.target.checked ? 'split' : 'all')
                    }
                    type='checkbox'
                  />
                  {translate('compare.onlySplit')}
                  <span className='tab-count'>{split.length}</span>
                </label>
              )}
              {shown.length === 0 ? (
                <p className='compare-empty'>
                  {translate(
                    matching.length === 0
                      ? EMPTY_LIST_KEYS.all
                      : EMPTY_LIST_KEYS[filters.agreement]
                  )}
                </p>
              ) : view === 'ledger' ? (
                <VoteLedger
                  columns={compared}
                  kind={filters.kind}
                  votes={shown}
                />
              ) : (
                <CampList
                  kind={filters.kind}
                  parties={compared}
                  votes={shown}
                />
              )}
              <div className='compare-notes'>
                <p className='record-note'>
                  {translate(`compare.notes.${filters.kind}`)}
                </p>
                <p className='record-note'>{translate('common.nominalOnly')}</p>
              </div>
            </RecordCard>
          </div>
        </>
      )}
    </>
  )
}

const ComparisonOrFailure: React.FC<{ view: ComparedView }> = ({ view }) => {
  const { comparison } = useCompareData()
  const result = use(comparison)

  return result.status === 'failure' ? (
    <DatasetFailure error={result.error} />
  ) : (
    <ComparisonView comparison={result.data} view={view} />
  )
}

export const ComparePage: React.FC = () => {
  const translate = useTranslate()
  const [viewValue, setView] = useSearchValue('view', {
    clears: ['agreement']
  })
  const view = parseComparedView(viewValue)

  useDocumentTitle(translate('compare.title'))

  return (
    <Main className='compare-page'>
      <PageIntro
        lead={translate(`compare.lead.${view}`)}
        title={translate('compare.title')}
      />
      <ToggleButtonGroup
        aria-label={translate('compare.viewsLabel')}
        className='compare-views'
        onSelectionChange={(keys) => {
          const [key] = keys
          const chosen = COMPARED_VIEWS.find((each) => each === key)
          if (chosen !== undefined) {
            setView(comparedViewSearchValue(chosen))
          }
        }}
        selectedKeys={[view]}
      >
        {COMPARED_VIEWS.map((each) => (
          <ToggleButton id={each} key={each}>
            {translate(`compare.views.${each}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Suspense fallback={<LoadingLines lines={10} />}>
        <ComparisonOrFailure view={view} />
      </Suspense>
    </Main>
  )
}
