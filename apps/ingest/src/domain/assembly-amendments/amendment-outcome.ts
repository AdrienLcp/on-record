import type { AmendmentOutcome } from '@on-record/protocol/assembly/amendment.ts'

/** `cycleDeVie.sort`, set once an amendment's turn came. */
const OUTCOME_BY_SORT: Readonly<Record<string, AmendmentOutcome>> = {
  Adopté: 'adopted',
  'Non soutenu': 'notMoved',
  Rejeté: 'rejected',
  Retiré: 'withdrawn',
  Tombé: 'fell'
}

/** The processing state of an amendment withdrawn before its turn. */
const WITHDRAWN_STATE = 'RT'

/** Every inadmissibility state starts so: `IR` (article 40), `IRR45`, `IRRSA`… */
const INADMISSIBLE_STATE_PREFIX = 'IR'

/**
 * What became of an amendment. The sort says it once the amendment's turn
 * came; before that, only the processing state tells a withdrawal or an
 * inadmissibility from an amendment still waiting.
 */
export const toAmendmentOutcome = ({
  sort,
  stateCode
}: {
  sort: string | null
  stateCode: string
}): AmendmentOutcome => {
  const sorted = sort === null ? undefined : OUTCOME_BY_SORT[sort]
  if (sorted !== undefined) return sorted
  if (stateCode === WITHDRAWN_STATE) return 'withdrawn'
  if (stateCode.startsWith(INADMISSIBLE_STATE_PREFIX)) return 'inadmissible'
  return 'pending'
}
