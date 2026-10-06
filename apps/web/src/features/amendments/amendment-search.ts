import type {
  AmendmentOutcome,
  LegislativeFileTitles,
  TabledAmendment
} from '@on-record/protocol/assembly/amendment'

import { isSittingOrgan } from './amendment-stage'

/** One amendment as a deputy's list shows it, with the title of its text. */
export type AmendmentLine = TabledAmendment & {
  /** `null` when the amendment is filed under no known legislative file. */
  fileTitle: string | null
}

export const amendmentLinesOf = ({
  amendments,
  fileTitles
}: {
  amendments: readonly TabledAmendment[]
  fileTitles: LegislativeFileTitles
}): AmendmentLine[] => {
  const titleById = new Map(fileTitles.map(({ id, title }) => [id, title]))

  return amendments.map((amendment) => ({
    ...amendment,
    fileTitle:
      amendment.legislativeFileId === null
        ? null
        : (titleById.get(amendment.legislativeFileId) ?? null)
  }))
}

/** Where to look: every amendment, those for the sitting, or those in committee. */
export const STAGE_FILTERS = ['all', 'sitting', 'committee'] as const

export type StageFilter = (typeof STAGE_FILTERS)[number]

export const parseStageFilter = (value: string | null): StageFilter =>
  STAGE_FILTERS.find((filter) => filter === value) ?? 'all'

/** What became of them, decided by a vote first, set aside without one next. */
export const OUTCOME_FILTERS = [
  'all',
  'adopted',
  'rejected',
  'withdrawn',
  'fell',
  'notMoved',
  'inadmissible',
  'pending'
] as const satisfies readonly ('all' | AmendmentOutcome)[]

export type OutcomeFilter = (typeof OUTCOME_FILTERS)[number]

export const parseOutcomeFilter = (value: string | null): OutcomeFilter =>
  OUTCOME_FILTERS.find((filter) => filter === value) ?? 'all'

const isOnStage = (line: AmendmentLine, stage: StageFilter): boolean =>
  stage === 'all' || (stage === 'sitting') === isSittingOrgan(line.organ)

export const filterAmendmentLines = ({
  filters,
  lines
}: {
  filters: { outcome: OutcomeFilter; stage: StageFilter }
  lines: readonly AmendmentLine[]
}): AmendmentLine[] =>
  lines.filter(
    (line) =>
      isOnStage(line, filters.stage) &&
      (filters.outcome === 'all' || line.outcome === filters.outcome)
  )

/** How many lines each outcome filter would show at a stage, so each option states its count. */
export const outcomeCountsOf = ({
  lines,
  stage
}: {
  lines: readonly AmendmentLine[]
  stage: StageFilter
}): { count: number; outcome: OutcomeFilter }[] => {
  const onStage = lines.filter((line) => isOnStage(line, stage))

  return OUTCOME_FILTERS.map((outcome) => ({
    count: filterAmendmentLines({ filters: { outcome, stage }, lines: onStage })
      .length,
    outcome
  }))
}
