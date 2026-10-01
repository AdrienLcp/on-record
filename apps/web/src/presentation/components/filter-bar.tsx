import type React from 'react'

import { VisuallyHidden } from '@/presentation/components/ui/visually-hidden'

import './filter-bar.sass'

type FilterBarProps = {
  children: React.ReactNode
  /** Names the filters for a screen reader; the fields' own labels show. */
  legend: string
}

/** The fields that narrow a list, stacked on a phone and in one row on a desk. */
export const FilterBar: React.FC<FilterBarProps> = ({ children, legend }) => (
  <fieldset className='filter-bar'>
    <VisuallyHidden elementType='legend'>{legend}</VisuallyHidden>
    {children}
  </fieldset>
)
