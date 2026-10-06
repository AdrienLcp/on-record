import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  type LucideIcon,
  Search,
  X
} from 'lucide-react'
import type React from 'react'

const GLYPHS = {
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  clear: X,
  newTab: ExternalLink,
  search: Search
} as const satisfies Record<string, LucideIcon>

export type IconName = keyof typeof GLYPHS

/** Lucide's 24-unit box at the weight the site's 20-unit drawings had: a 1.75 stroke there. */
const ICON_STROKE_WIDTH = 2.1

/** Where no stylesheet sizes the icon. */
const ICON_SIZE = 20

type IconProps = {
  className?: string
  name: IconName
}

/** Decorative: whatever it marks is also named in text. */
export const Icon: React.FC<IconProps> = ({ className, name }) => {
  const Glyph = GLYPHS[name]

  return (
    <Glyph
      aria-hidden='true'
      className={className}
      focusable='false'
      size={ICON_SIZE}
      strokeWidth={ICON_STROKE_WIDTH}
    />
  )
}
