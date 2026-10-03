import { COMPARED_VIEWS, type ComparedView } from './party-comparison'

/** The view as the URL writes it, in the reader's language: the ledger, the default, leaves no parameter. */
const VIEW_SEARCH_VALUES = {
  camps: 'camps',
  ledger: null,
  texts: 'textes'
} as const satisfies Record<ComparedView, string | null>

export const parseComparedView = (value: string | null): ComparedView =>
  COMPARED_VIEWS.find((view) => VIEW_SEARCH_VALUES[view] === value) ?? 'ledger'

export const comparedViewSearchValue = (view: ComparedView): string | null =>
  VIEW_SEARCH_VALUES[view]
