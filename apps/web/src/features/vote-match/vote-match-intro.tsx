import type React from 'react'

import { paths } from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/ui/button'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

type VoteMatchIntroProps = {
  count: number
  onStart: () => void
}

/** The way into the path, and the way to the full comparison beside it. */
export const VoteMatchIntro: React.FC<VoteMatchIntroProps> = ({
  count,
  onStart
}) => {
  const translate = useTranslate()

  return (
    <div className='vote-match-intro'>
      <div className='vote-match-actions'>
        <Button className='primary' onPress={onStart}>
          {translate('voteMatch.start')}
        </Button>
        <TextLink href={paths.compare}>
          {translate('voteMatch.compare')}
        </TextLink>
      </div>
      <p className='vote-match-note'>
        {translate('voteMatch.startNote', { count })}
      </p>
    </div>
  )
}
