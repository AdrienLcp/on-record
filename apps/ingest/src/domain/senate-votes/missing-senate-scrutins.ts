import type { MissingSenateScrutin } from '@on-record/protocol/senate/senate-scrutin.ts'
import {
  type SenateScrutinNumber,
  senateScrutinIdFor
} from '@on-record/protocol/senate/senate-scrutin-number.ts'

/**
 * The numbers each session skipped: scrutins the Senate held and left out of
 * its dump. One missing after a session's last published number cannot be
 * seen. Newest first.
 */
export const findMissingSenateScrutins = (
  published: readonly SenateScrutinNumber[]
): MissingSenateScrutin[] => {
  const numbersBySession = new Map<number, Set<number>>()
  for (const { number, session } of published) {
    numbersBySession.set(
      session,
      (numbersBySession.get(session) ?? new Set()).add(number)
    )
  }
  return [...numbersBySession]
    .toSorted(([left], [right]) => right - left)
    .flatMap(([session, numbers]) =>
      Array.from({ length: Math.max(...numbers) }, (_, index) => index + 1)
        .filter((number) => !numbers.has(number))
        .toReversed()
        .map((number) => ({
          id: senateScrutinIdFor({ number, session }),
          number,
          session
        }))
    )
}
