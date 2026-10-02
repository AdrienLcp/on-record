import type React from 'react'

import { RaceDisclosure } from '@/features/parties/race-disclosure'
import { dateOfDay } from '@/helpers/iso-day'
import { paths } from '@/infrastructure/router/navigation'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import { VOTE_MATCH_SELECTION } from './vote-match-selection'

import './vote-match-disclosure.sass'

const strong = (children: React.ReactNode) => (
  <strong key='strong'>{children}</strong>
)

/** Who chose the texts and the parties, how a party's vote is read, who wrote the summaries (principle 7). */
export const VoteMatchDisclosure: React.FC = () => {
  const translate = useTranslate()

  return (
    <aside
      aria-label={translate('voteMatch.disclosureLabel')}
      className='vote-match-disclosure'
    >
      <p>
        <RichText
          parts={translate.rich('voteMatch.disclosure.selection', {
            compare: (children) => (
              <TextLink href={paths.compare} key='compare'>
                {children}
              </TextLink>
            ),
            day: dateOfDay(VOTE_MATCH_SELECTION.chosenOn),
            strong
          })}
        />
      </p>
      <p>
        <RichText
          parts={translate.rich('voteMatch.disclosure.partyVote', { strong })}
        />
      </p>
      <p>
        <RichText
          parts={translate.rich('voteMatch.disclosure.summaries', { strong })}
        />
      </p>
      <RaceDisclosure />
      <p>{translate('common.nominalOnly')}</p>
    </aside>
  )
}
