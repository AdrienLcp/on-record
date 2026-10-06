import type { SenateScrutinId } from './senate-ids'

/** A Senate scrutin is numbered within a session, which opens each October. */
export type SenateScrutinNumber = {
  number: number
  /** The year the session opened: `2025` for 2025-2026. */
  session: number
}

export const senateScrutinIdFor = ({
  number,
  session
}: SenateScrutinNumber): SenateScrutinId => `${session}-${number}`

/** `null` when the text is not a Senate scrutin id. */
export const parseSenateScrutinId = (
  text: string
): SenateScrutinNumber | null => {
  const match = /^(\d{4})-([1-9]\d*)$/.exec(text)
  if (match === null) return null
  return { number: Number(match[2]), session: Number(match[1]) }
}

export const SENATE_SCRUTINS_PER_BLOCK = 100

/** The file a scrutin's detail is published in: `2025-3` for 2025-340. */
export const senateScrutinBlockOf = ({
  number,
  session
}: SenateScrutinNumber): string =>
  `${session}-${Math.floor(number / SENATE_SCRUTINS_PER_BLOCK)}`
