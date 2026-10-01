import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids'

import { isSitting, leftOfficeOn } from '@/features/deputies/deputy'

/** A constituency: its number within a department. */
export type Seat = { constituency: number; department: DepartmentCode }

/**
 * Who answers for a constituency today:
 * - `sitting` — the deputy holding the seat
 * - `vacant` — nobody holds it, until a by-election or a substitute; the last
 *   deputy who did, if the data knows one
 */
export type SeatHolder =
  | { deputy: Deputy; status: 'sitting' }
  | { lastHolder: Deputy | null; status: 'vacant' }

const holdsSeat = (deputy: Deputy, seat: Seat): boolean =>
  deputy.department.code === seat.department &&
  deputy.constituency === seat.constituency

export const seatHolderOf = ({
  deputies,
  seat
}: {
  deputies: readonly Deputy[]
  seat: Seat
}): SeatHolder => {
  const holders = deputies.filter((deputy) => holdsSeat(deputy, seat))
  const sitting = holders.find(isSitting)

  if (sitting !== undefined) {
    return { deputy: sitting, status: 'sitting' }
  }

  const lastHolder =
    holders.toSorted((first, second) =>
      (leftOfficeOn(second) ?? '').localeCompare(leftOfficeOn(first) ?? '')
    )[0] ?? null

  return { lastHolder, status: 'vacant' }
}
