import type React from 'react'

import type { Deputy } from '@on-record/protocol/assembly/deputy'

import type { Commune } from '@/features/communes/commune'
import { fullNameOf } from '@/features/deputies/deputy'
import { deputyPathFor } from '@/infrastructure/router/navigation'
import { Link } from '@/presentation/components/ui/link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { seatHolderOf } from './seat-holder'

import './commune-seats.sass'

type CommuneSeatsProps = {
  commune: Commune
  deputies: readonly Deputy[]
}

/** Every constituency a split commune lies in, and who sits for each. */
export const CommuneSeats: React.FC<CommuneSeatsProps> = ({
  commune,
  deputies
}) => {
  const translate = useTranslate()

  return (
    <ol className='ruled-list commune-seats'>
      {commune.constituencies.map((constituency) => {
        const holder = seatHolderOf({
          deputies,
          seat: { constituency, department: commune.department }
        })

        return (
          <li className='commune-seat' key={constituency}>
            <span className='commune-seat-number'>
              {translate('findMyDeputy.split.constituency', {
                number: constituency
              })}
            </span>
            {holder.status === 'sitting' ? (
              <Link
                className='commune-seat-holder'
                href={deputyPathFor(holder.deputy.id)}
              >
                {fullNameOf(holder.deputy)}
              </Link>
            ) : (
              <span className='commune-seat-holder'>
                {translate('findMyDeputy.split.vacant')}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
