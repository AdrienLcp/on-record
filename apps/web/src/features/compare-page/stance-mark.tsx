import type React from 'react'

import { BallotMark } from '@/features/scrutins/ballot-mark'
import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import type { PartyStance } from './party-comparison'

import './stance-mark.sass'

type StanceMarkProps = {
  stance: PartyStance
  /** Whether the stance's name follows the mark (default: `true`). */
  withLabel?: boolean
}

const OwnDisc: React.FC<{
  stance: Exclude<PartyStance, 'abstention' | 'against' | 'for' | 'nonVoting'>
}> = ({ stance }) => {
  if (stance === 'someVoices') {
    return (
      <>
        <circle className='disc-ring' cx='10' cy='10' r='7.5' />
        <path className='disc-half' d='M10 2.5a7.5 7.5 0 0 1 0 15z' />
      </>
    )
  }

  if (stance === 'backed') {
    return (
      <>
        <circle className='disc' cx='10' cy='10' r='8.25' />
        <path className='stroke' d='M6 10.5l2.6 2.6L14 7.5' />
      </>
    )
  }

  return (
    <>
      <circle className='disc' cx='10' cy='10' r='8.25' />
      {stance !== 'notBacked' && <path className='stroke' d='M7 10h6' />}
    </>
  )
}

/**
 * A party's stance as a ballot disc. Published positions are the ballot
 * marks of every other page; the stances only a comparison has — a motion of
 * censure read by its members' votes, a group with no position or not
 * sitting — get shapes of their own, so none reads by colour alone.
 */
export const StanceMark: React.FC<StanceMarkProps> = ({
  stance,
  withLabel = true
}) => {
  const translate = useTranslate()

  if (
    stance === 'abstention' ||
    stance === 'against' ||
    stance === 'for' ||
    stance === 'nonVoting'
  ) {
    return <BallotMark position={stance} withLabel={withLabel} />
  }

  const label = translate(`compare.stance.${stance}`)

  return (
    <span className={`ballot-mark stance-mark ${stance}`}>
      <svg
        aria-hidden='true'
        className='ballot-disc'
        focusable='false'
        height='20'
        viewBox='0 0 20 20'
        width='20'
      >
        <OwnDisc stance={stance} />
      </svg>
      {withLabel ? (
        <span className='ballot-label'>{label}</span>
      ) : (
        <VisuallyHidden elementType='span'>{label}</VisuallyHidden>
      )}
    </span>
  )
}
