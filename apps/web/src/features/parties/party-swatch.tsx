import type React from 'react'

import './party-swatch.sass'

/** A group's colour as a divider tab; hatched when it has no official colour. */
export const PartySwatch: React.FC<{
  background: string | null | undefined
}> = ({ background }) => (
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
