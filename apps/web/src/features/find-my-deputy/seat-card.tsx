import type React from 'react'

import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'

import {
  fullNameOf,
  latestGroupIdOf,
  leftOfficeOn
} from '@/features/deputies/deputy'
import { GroupLabel } from '@/features/groups/group-label'
import { groupsById } from '@/features/groups/group-members'
import { dateOfDay } from '@/infrastructure/dates'
import { deputyPathFor } from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { Link } from '@/presentation/components/ui/link'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { type Seat, seatHolderOf } from './seat-holder'

import './seat-card.sass'

type SeatCardProps = {
  deputies: readonly Deputy[]
  groups: readonly Group[]
  /** The commune or address the answer is for, said in the card's corner. */
  place: string
  seat: Seat
}

/** The answer: who sits for this constituency today, or that nobody does. */
export const SeatCard: React.FC<SeatCardProps> = ({
  deputies,
  groups,
  place,
  seat
}) => {
  const translate = useTranslate()
  const holder = seatHolderOf({ deputies, seat })
  const knownHolder =
    holder.status === 'sitting' ? holder.deputy : holder.lastHolder
  const lastHolderLeftOn =
    holder.status === 'vacant' && holder.lastHolder !== null
      ? leftOfficeOn(holder.lastHolder)
      : null
  const seatLabel = translate('deputy.constituency', {
    department: knownHolder?.department.name ?? seat.department,
    number: seat.constituency
  })
  const groupOf = (deputy: Deputy): Group | null => {
    const groupId = latestGroupIdOf(deputy)

    return groupId === null ? null : (groupsById(groups).get(groupId) ?? null)
  }

  return (
    <RecordCard
      className='seat-card'
      heading={
        holder.status === 'sitting'
          ? translate('findMyDeputy.seat.title')
          : translate('findMyDeputy.seat.vacantTitle')
      }
      reference={place}
    >
      <p className='seat-constituency'>{seatLabel}</p>
      {holder.status === 'sitting' ? (
        <div className='seat-holder'>
          <Link
            className='seat-holder-name'
            href={deputyPathFor(holder.deputy.id)}
          >
            {fullNameOf(holder.deputy)}
          </Link>
          <GroupLabel group={groupOf(holder.deputy)} length='full' />
          <TextLink href={deputyPathFor(holder.deputy.id)}>
            {translate('findMyDeputy.seat.record')}
          </TextLink>
        </div>
      ) : (
        <div className='seat-holder vacant'>
          <p className='seat-vacancy'>
            {translate('findMyDeputy.seat.vacant')}
          </p>
          <p className='record-note'>
            {translate('findMyDeputy.seat.vacantNote')}
          </p>
          {holder.lastHolder !== null && lastHolderLeftOn !== null && (
            <p className='record-note'>
              {translate('findMyDeputy.seat.lastHolder', {
                name: fullNameOf(holder.lastHolder),
                to: dateOfDay(lastHolderLeftOn)
              })}{' '}
              <TextLink href={deputyPathFor(holder.lastHolder.id)}>
                {translate('findMyDeputy.seat.lastHolderRecord')}
              </TextLink>
            </p>
          )}
        </div>
      )}
    </RecordCard>
  )
}
