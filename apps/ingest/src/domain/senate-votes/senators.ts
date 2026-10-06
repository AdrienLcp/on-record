import type { SenateGroup } from '@on-record/protocol/senate/senate-group.ts'
import type {
  SenateGroupMembership,
  Senator
} from '@on-record/protocol/senate/senator.ts'

import { toGroupMemberships } from '@/domain/assembly-votes/group-at-date.ts'
import type {
  RawConstituencyRow,
  RawGroupMembershipRow,
  RawGroupRow,
  RawSeatRow,
  RawSenatorRow
} from '@/domain/senate-votes/raw-senate-rows.ts'

/** The code of the placeholder the Senate files newly elected senators under until groups form. */
const NO_GROUP_YET = 'AUCUN'

/** « Français établis hors de France (Série 1) »: the series is the Senate's bookkeeping. */
const withoutSeries = (name: string): string =>
  name.replace(/\s*\(Série \d+\)$/, '')

const overlaps = (
  spell: { from: string; to: string | null },
  since: string
): boolean => spell.to === null || spell.to >= since

const groupBy = <Row, Key>(
  rows: readonly Row[],
  keyOf: (row: Row) => Key
): Map<Key, Row[]> => {
  const groups = new Map<Key, Row[]>()
  for (const row of rows) {
    const key = keyOf(row)
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return groups
}

const toMemberships = (
  rows: readonly RawGroupMembershipRow[]
): SenateGroupMembership[] =>
  toGroupMemberships(
    rows.flatMap((row) =>
      row.grppolcod === NO_GROUP_YET || row.memgrppoldatdeb === null
        ? []
        : [
            {
              from: row.memgrppoldatdeb,
              groupId: row.grppolcod,
              to: row.memgrppoldatfin
            }
          ]
    )
  )

/**
 * Everyone who held a seat on or after `since`, with the seats and group
 * spells that reach it. Groups are named by their latest name.
 */
export const toSenators = ({
  constituencies,
  groupRows,
  memberships,
  seats,
  senators,
  since
}: {
  constituencies: readonly RawConstituencyRow[]
  groupRows: readonly RawGroupRow[]
  memberships: readonly RawGroupMembershipRow[]
  seats: readonly RawSeatRow[]
  senators: readonly RawSenatorRow[]
  since: string
}): { groups: SenateGroup[]; senators: Senator[] } => {
  const constituencyByNumber = new Map(
    constituencies.map((row) => [row.dptnum, row])
  )
  const seatsBySenator = groupBy(
    seats.filter((seat) =>
      overlaps({ from: seat.eludatdeb, to: seat.eludatfin }, since)
    ),
    (seat) => seat.senmat
  )
  const membershipsBySenator = groupBy(memberships, (row) => row.senmat)

  const covered = senators.flatMap((row): Senator[] => {
    const senatorSeats = (seatsBySenator.get(row.senmat) ?? []).toSorted(
      (left, right) => left.eludatdeb.localeCompare(right.eludatdeb)
    )
    const latestSeat = senatorSeats.at(-1)
    if (latestSeat === undefined) return []
    const constituency = constituencyByNumber.get(latestSeat.dptnum)
    return [
      {
        birthDate: row.sendatnai,
        constituency: {
          code: constituency?.dptcod ?? latestSeat.dptnum,
          name: withoutSeries(constituency?.dptlib ?? latestSeat.dptnum)
        },
        firstName: row.senprenomuse,
        gender: row.quacod === 'M.' ? 'male' : 'female',
        groups: toMemberships(
          membershipsBySenator.get(row.senmat) ?? []
        ).filter((spell) => overlaps(spell, since)),
        hatvpUrl: row.sendaiurl,
        id: row.senmat,
        lastName: row.sennomuse,
        mandates: senatorSeats.map((seat) => ({
          from: seat.eludatdeb,
          to: seat.eludatfin
        })),
        profession: row.sendespro
      }
    ]
  })

  const groupIds = new Set(
    covered.flatMap((senator) => senator.groups.map((spell) => spell.groupId))
  )
  return {
    groups: groupRows
      .filter((row) => groupIds.has(row.grppolcod))
      .map((row) => ({
        color: null,
        id: row.grppolcod,
        name: row.grppollilcou,
        shortName: row.grppolliccou
      })),
    senators: covered
  }
}
