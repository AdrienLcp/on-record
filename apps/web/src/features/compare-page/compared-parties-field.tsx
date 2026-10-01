import type React from 'react'
import { useId } from 'react'

import type { Group } from '@on-record/protocol/assembly/group'

import { isPartyChoice } from '@/features/parties/party-selection'
import { PartySwatch } from '@/features/parties/party-swatch'
import { PRESIDENTIAL_RACE } from '@/features/parties/presidential-race'
import { RaceDisclosure } from '@/features/parties/race-disclosure'
import type { PartySelection } from '@/features/parties/use-party-selection'
import {
  ToggleChip,
  ToggleChipGroup
} from '@/presentation/components/ui/toggle-chip-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './compared-parties-field.sass'

type ComparedPartiesFieldProps = {
  groups: readonly Group[]
  selection: PartySelection
}

/**
 * One chip per party in the race, none pressed comparing them all, and who
 * chose that list folded underneath (principle 7).
 */
export const ComparedPartiesField: React.FC<ComparedPartiesFieldProps> = ({
  groups,
  selection
}) => {
  const translate = useTranslate()
  const labelId = useId()

  return (
    <section aria-labelledby={labelId} className='compared-parties'>
      <div className='compared-parties-row'>
        <span className='compared-parties-label' id={labelId}>
          {translate('compare.parties')}
        </span>
        <ToggleChipGroup
          aria-labelledby={labelId}
          onSelectionChange={(keys) =>
            selection.choose(
              [...keys]
                .filter(isPartyChoice)
                .filter((choice) => choice !== 'others')
            )
          }
          selectedKeys={selection.choices}
        >
          {PRESIDENTIAL_RACE.parties.map((party) => {
            const group = groups.find((each) => each.id === party.groupId)

            return (
              <ToggleChip id={party.id} key={party.id}>
                <PartySwatch background={group?.color} />
                {translate(`party.names.${party.id}`)}
                {!party.groupBearsItsName && group !== undefined && (
                  <span className='compared-party-group'>
                    {group.shortName}
                  </span>
                )}
              </ToggleChip>
            )
          })}
        </ToggleChipGroup>
      </div>
      <details className='race-details'>
        <summary>{translate('compare.why')}</summary>
        <RaceDisclosure />
      </details>
    </section>
  )
}
