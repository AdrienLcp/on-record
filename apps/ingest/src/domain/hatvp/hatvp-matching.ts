import type { HatvpPerson } from '@/domain/hatvp/hatvp-list.ts'

/** A parliamentarian of the chamber's own data, to be found in the HATVP list. */
export type ChamberMember = {
  firstName: string
  /** The page the chamber's data links to; may be missing or stale. */
  hatvpUrl: string | null
  /** The member's id in the chamber's data. */
  id: string
  lastName: string
  /** The member's id as the HATVP writes it in `id_origine`. */
  originId: string
}

export type MatchMethod = 'name' | 'originId' | 'pageNumber'

export type HatvpMatchReport = Record<MatchMethod | 'unmatched', number>

/** The number ending a HATVP page path, `27452` in `/pages_nominatives/lahmar-abdelkader-27452`. */
const pageNumberOf = (path: string): string | null =>
  /-(\d+)\/?$/.exec(path)?.[1] ?? null

const pageNumberOfUrl = (url: string | null): string | null => {
  if (url === null || !URL.canParse(url)) return null
  return pageNumberOf(new URL(url).pathname)
}

/**
 * A person's name reduced to what both sides agree on: no accents, no case,
 * no suffix the HATVP adds to tell namesakes apart (« MARTIN (GIRONDE) »), and
 * the words in any order, since first names come in either order.
 */
export const nameKeyOf = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName.replace(/\([^)]*\)/g, ' ')}`
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word !== '')
    .toSorted()
    .join(' ')

type Matcher = {
  keyOfMember: (member: ChamberMember) => string | null
  keyOfPerson: (person: HatvpPerson) => string | null
  method: MatchMethod
}

/** Tried in this order: the id the HATVP copies from the chamber, the page the chamber links to, then the name. */
const MATCHERS: readonly Matcher[] = [
  {
    keyOfMember: (member) => member.originId,
    keyOfPerson: (person) => person.originId,
    method: 'originId'
  },
  {
    keyOfMember: (member) => pageNumberOfUrl(member.hatvpUrl),
    keyOfPerson: (person) => pageNumberOf(person.pagePath),
    method: 'pageNumber'
  },
  {
    keyOfMember: (member) => nameKeyOf(member.firstName, member.lastName),
    keyOfPerson: (person) => nameKeyOf(person.firstName, person.lastName),
    method: 'name'
  }
]

/** People indexed by key; a key two people share is dropped, never guessed between. */
const uniqueIndex = (
  people: readonly HatvpPerson[],
  keyOf: (person: HatvpPerson) => string | null
): Map<string, HatvpPerson> => {
  const index = new Map<string, HatvpPerson>()
  const shared = new Set<string>()
  for (const person of people) {
    const key = keyOf(person)
    if (key === null) continue
    if (index.has(key)) shared.add(key)
    else index.set(key, person)
  }
  for (const key of shared) index.delete(key)
  return index
}

/**
 * Each member's entry in the HATVP list, keyed by member id. A person is
 * given to one member at most; a member none of the keys finds is left out.
 */
export const matchHatvpPeople = ({
  members,
  people
}: {
  members: readonly ChamberMember[]
  people: readonly HatvpPerson[]
}): { matches: Map<string, HatvpPerson>; report: HatvpMatchReport } => {
  const matches = new Map<string, HatvpPerson>()
  const taken = new Set<HatvpPerson>()
  const report: HatvpMatchReport = {
    name: 0,
    originId: 0,
    pageNumber: 0,
    unmatched: 0
  }
  for (const { keyOfMember, keyOfPerson, method } of MATCHERS) {
    const index = uniqueIndex(
      people.filter((person) => !taken.has(person)),
      keyOfPerson
    )
    for (const member of members) {
      if (matches.has(member.id)) continue
      const key = keyOfMember(member)
      const person = key === null ? undefined : index.get(key)
      if (person === undefined || taken.has(person)) continue
      matches.set(member.id, person)
      taken.add(person)
      report[method] += 1
    }
  }
  report.unmatched = members.length - matches.size
  return { matches, report }
}
