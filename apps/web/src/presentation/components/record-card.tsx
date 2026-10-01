import type React from 'react'
import { useId } from 'react'

import './record-card.sass'

type RecordCardProps = {
  children: React.ReactNode
  className?: string
  heading: React.ReactNode
  /** The outline level of the card's heading (default: `2`). */
  headingLevel?: 2 | 3
  /**
   * What the record is filed under, set in data numerals in the corner: a
   * scrutin number, a count.
   */
  reference?: React.ReactNode
}

/**
 * The site's one container: a ruled record card, its heading over the red
 * head rule of an index card, its reference in the corner.
 */
export const RecordCard: React.FC<RecordCardProps> = ({
  children,
  className,
  heading,
  headingLevel = 2,
  reference
}) => {
  const headingId = useId()
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <section
      aria-labelledby={headingId}
      className={
        className === undefined ? 'record-card' : `record-card ${className}`
      }
    >
      <header className='record-card-head'>
        <Heading className='record-card-heading' id={headingId}>
          {heading}
        </Heading>
        {reference !== undefined && (
          <p className='record-card-reference'>{reference}</p>
        )}
      </header>
      <div className='record-card-body'>{children}</div>
    </section>
  )
}
