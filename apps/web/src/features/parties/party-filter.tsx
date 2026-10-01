import type React from 'react'
import { useId } from 'react'

import type { Group } from '@on-record/protocol/assembly/group'

import { Button } from '@/presentation/components/ui/button'
import {
  ToggleChip,
  ToggleChipGroup
} from '@/presentation/components/ui/toggle-chip-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { isPartyChoice } from './party-selection'
import { PRESIDENTIAL_RACE, racePartyOfGroup } from './presidential-race'
import type { PartySelection } from './use-party-selection'

import './party-filter.sass'

const OTHERS_SWATCH_BANDS = 4

/** The other groups' colours as stacked bands: the chip stands for all of them. */
const stackedColorsOf = (groups: readonly Group[]): string | undefined => {
  const colors = groups
    .flatMap((group) => (group.color === null ? [] : [group.color]))
    .slice(0, OTHERS_SWATCH_BANDS)

  if (colors.length === 0) {
    return undefined
  }

  const band = 100 / colors.length

  return `linear-gradient(180deg, ${colors
    .map((color, index) => `${color} ${index * band}% ${(index + 1) * band}%`)
    .join(', ')})`
}

const PartySwatch: React.FC<{ background: string | null | undefined }> = ({
  background
}) => (
  <span
    aria-hidden='true'
    className={
      background === null || background === undefined
        ? 'party-swatch uncoloured'
        : 'party-swatch'
    }
    style={
      background === null || background === undefined
        ? undefined
        : { '--swatch': background }
    }
  />
)

type PartyFilterProps = {
  className?: string
  /** The groups the page lists: every one no race party votes through is under "Autres groupes". */
  groups: readonly Group[]
  selection: PartySelection
}

/**
 * Chips for the parties in the 2027 race and one for the other groups; the
 * page shows only the groups of those pressed, or every group when none is.
 */
export const PartyFilter: React.FC<PartyFilterProps> = ({
  className,
  groups,
  selection
}) => {
  const translate = useTranslate()
  const labelId = useId()
  const otherGroups = groups.filter(
    (group) => racePartyOfGroup(group.id) === null
  )
  const shownCount = groups.filter((group) =>
    selection.showsGroup(group.id)
  ).length

  return (
    <section
      aria-label={translate('party.filterLabel')}
      className={
        className === undefined ? 'party-filter' : `party-filter ${className}`
      }
    >
      <div className='party-filter-row'>
        <span className='party-filter-label' id={labelId}>
          {translate('party.showOnly')}
        </span>
        <ToggleChipGroup
          aria-labelledby={labelId}
          onSelectionChange={(keys) =>
            selection.choose([...keys].filter(isPartyChoice))
          }
          selectedKeys={selection.choices}
        >
          {PRESIDENTIAL_RACE.parties.map((party) => {
            const group = groups.find((each) => each.id === party.groupId)

            return (
              <ToggleChip id={party.id} key={party.id}>
                <PartySwatch background={group?.color ?? null} />
                {translate(`party.names.${party.id}`)}
                {!party.groupBearsItsName && group !== undefined && (
                  <span className='party-chip-group'>{group.shortName}</span>
                )}
              </ToggleChip>
            )
          })}
          <ToggleChip className='others-chip' id='others'>
            <PartySwatch background={stackedColorsOf(otherGroups)} />
            {translate('party.others')}
            <span className='party-chip-group'>{otherGroups.length}</span>
          </ToggleChip>
        </ToggleChipGroup>
      </div>
      <p aria-live='polite' className='party-filter-status'>
        {selection.isFiltered ? (
          <>
            {translate('party.status', {
              count: shownCount,
              total: groups.length
            })}
            <Button
              className='inline-action'
              onPress={() => selection.choose([])}
            >
              {translate('party.showAll')}
            </Button>
          </>
        ) : (
          translate('party.statusAll')
        )}
      </p>
    </section>
  )
}
