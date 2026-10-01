import type React from 'react'

/** Drawn on a 20-unit grid, 1.75 stroke, round ends: one family for the whole site. */
const ICON_PATHS = {
  arrowLeft: 'M16 10H4M9 5l-5 5 5 5',
  chevronDown: 'M5 8l5 5 5-5',
  clear: 'M5 5l10 10M15 5L5 15',
  newTab: 'M8 4H4v12h12v-4M11 4h5v5M16 4l-7 7',
  search: 'M8.5 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM12.5 12.5L17 17'
} as const

export type IconName = keyof typeof ICON_PATHS

type IconProps = {
  className?: string
  name: IconName
}

/** Decorative: whatever it marks is also named in text. */
export const Icon: React.FC<IconProps> = ({ className, name }) => (
  <svg
    aria-hidden='true'
    className={className}
    fill='none'
    focusable='false'
    height='20'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='1.75'
    viewBox='0 0 20 20'
    width='20'
  >
    <path d={ICON_PATHS[name]} />
  </svg>
)
