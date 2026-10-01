import type React from 'react'

import { PartySwatch } from '@/features/parties/party-swatch'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { ComparedParty } from './party-comparison'

import './compared-party-label.sass'

/** A party's swatch and name, with its group's acronym when the name does not say it. */
export const ComparedPartyLabel: React.FC<{ compared: ComparedParty }> = ({
  compared
}) => {
  const translate = useTranslate()

  return (
    <span className='compared-party-label'>
      <PartySwatch background={compared.group?.color} />
      <span className='compared-party-name'>
        {translate(`party.names.${compared.party.id}`)}
      </span>
      {!compared.party.groupBearsItsName && compared.group !== undefined && (
        <span className='compared-party-group'>{compared.group.shortName}</span>
      )}
    </span>
  )
}
