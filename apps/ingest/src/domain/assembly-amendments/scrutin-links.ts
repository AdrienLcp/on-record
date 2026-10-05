import type { AmendmentOutcome } from '@on-record/protocol/assembly/amendment.ts'
import type { ScrutinOutcome } from '@on-record/protocol/assembly/scrutin.ts'

import { bareAmendmentNumber } from '@/domain/assembly-amendments/official-amendment-path.ts'

/** What linking needs of an amendment, the government's included: they share the numbering. */
export type LinkableAmendment = {
  /** `discussionIdentique.idDiscussion`: amendments a scrutin decides together. */
  identicalDiscussionId: string | null
  number: string
  outcome: AmendmentOutcome
  sittingId: string | null
  uid: string
}

export type LinkableScrutin = {
  number: number
  outcome: ScrutinOutcome
  sittingId: string | null
  title: string
}

/**
 * "l'amendement n° 2194 de M. …", "le sous-amendement n° 643…". No structured
 * reference exists on either side: the title is the only link.
 */
const AMENDMENT_IN_TITLE = /^l[e'’]\s*(?:sous-)?amendement[^°]*?n°\s*(\d+)/iu

const linkKey = (sittingId: string, number: string): string =>
  `${sittingId}|${number}`

const amendmentNumberIn = (title: string): string | null =>
  title.replace(/ /g, ' ').match(AMENDMENT_IN_TITLE)?.[1] ?? null

/**
 * Amendment uid → the scrutin that decided it. A scrutin is matched on its
 * sitting and the number its title cites; it is kept only when one amendment
 * answers and both outcomes agree. The amendments identical to a matched one
 * in that sitting were decided by the same vote.
 */
export const toScrutinLinks = ({
  amendments,
  scrutins
}: {
  amendments: readonly LinkableAmendment[]
  scrutins: readonly LinkableScrutin[]
}): Map<string, number> => {
  const bySittingNumber = new Map<string, LinkableAmendment[]>()
  const byIdenticalDiscussion = new Map<string, LinkableAmendment[]>()
  const addTo = (
    index: Map<string, LinkableAmendment[]>,
    key: string,
    amendment: LinkableAmendment
  ) => {
    const listed = index.get(key)
    if (listed === undefined) index.set(key, [amendment])
    else listed.push(amendment)
  }
  for (const amendment of amendments) {
    if (amendment.sittingId === null) continue
    const number = bareAmendmentNumber(amendment.number)
    addTo(bySittingNumber, linkKey(amendment.sittingId, number), amendment)
    if (amendment.identicalDiscussionId !== null) {
      addTo(byIdenticalDiscussion, amendment.identicalDiscussionId, amendment)
    }
  }

  const links = new Map<string, number>()
  for (const scrutin of scrutins) {
    const number = amendmentNumberIn(scrutin.title)
    if (scrutin.sittingId === null || number === null) continue
    const candidates = bySittingNumber.get(linkKey(scrutin.sittingId, number))
    const amendment = candidates?.length === 1 ? candidates[0] : undefined
    if (amendment === undefined || amendment.outcome !== scrutin.outcome) {
      continue
    }
    const identical =
      amendment.identicalDiscussionId === null
        ? []
        : (byIdenticalDiscussion.get(amendment.identicalDiscussionId) ?? [])
    const decided = [amendment, ...identical].filter(
      (other) =>
        other.sittingId === scrutin.sittingId &&
        other.outcome === scrutin.outcome
    )
    for (const other of decided) {
      if (!links.has(other.uid)) links.set(other.uid, scrutin.number)
    }
  }
  return links
}
