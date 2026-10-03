import type { OrganId } from '@on-record/protocol/assembly/official-ids'

import {
  type SearchParamName,
  useSearchValue
} from '@/infrastructure/router/navigation'

import {
  parsePartyChoices,
  partyChoicesSearchValue
} from './party-choice-search-value'
import { isGroupShownBy, type PartyChoice } from './party-selection'

export type PartySelection = {
  choices: PartyChoice[]
  choose: (choices: readonly PartyChoice[]) => void
  isFiltered: boolean
  showsGroup: (groupId: OrganId | null) => boolean
}

/** The parties chosen in the URL, read by every part of a page it filters. */
export const usePartySelection = (
  options: { clears?: readonly SearchParamName[] } = {}
): PartySelection => {
  const [value, setValue] = useSearchValue('parties', options)
  const choices = parsePartyChoices(value)

  return {
    choices,
    choose: (next) => setValue(partyChoicesSearchValue(next)),
    isFiltered: choices.length > 0,
    showsGroup: (groupId) => isGroupShownBy({ choices, groupId })
  }
}
