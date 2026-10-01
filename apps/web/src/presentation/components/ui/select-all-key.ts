import type { Key } from 'react-aria-components'

/** The option of a filter that leaves the list unfiltered. */
const ALL_KEY = 'all'

/** The option to select for a filter value, `null` meaning everything. */
export const selectedKeyOf = (value: string | null): string => value ?? ALL_KEY

/** The filter value an option stands for, `null` for everything. */
export const filterValueOf = (key: Key | null): string | null =>
  typeof key === 'string' && key !== ALL_KEY ? key : null
