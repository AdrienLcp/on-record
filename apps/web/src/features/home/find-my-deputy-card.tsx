import type React from 'react'

import { CommuneField } from '@/features/communes/commune-field'
import {
  findMyDeputyPathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { RecordCard } from '@/presentation/components/record-card'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

/** Picking a commune opens the answer on its own page, which a link can share. */
export const FindMyDeputyCard: React.FC = () => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()

  return (
    <RecordCard
      className='find-my-deputy-card'
      heading={translate('findMyDeputy.title')}
    >
      <p className='record-note'>{translate('findMyDeputy.homeLead')}</p>
      <CommuneField
        onSelect={(commune) => navigateTo(findMyDeputyPathFor(commune.code))}
      />
    </RecordCard>
  )
}
