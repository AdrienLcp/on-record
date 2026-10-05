import { Result } from '@adrienlcp/result'
import { z } from 'zod'

import type {
  DeputyAmendments,
  LegislativeFileTitles,
  TabledAmendment
} from '@on-record/protocol/assembly/amendment.ts'
import type { DeputyId } from '@on-record/protocol/assembly/official-ids.ts'

import { toAmendmentOutcome } from '@/domain/assembly-amendments/amendment-outcome.ts'
import { toAmendmentSummary } from '@/domain/assembly-amendments/amendment-summary.ts'
import { officialAmendmentPath } from '@/domain/assembly-amendments/official-amendment-path.ts'
import { rawAmendmentFileSchema } from '@/domain/assembly-amendments/raw-amendment.ts'
import {
  type LinkableAmendment,
  type LinkableScrutin,
  toScrutinLinks
} from '@/domain/assembly-amendments/scrutin-links.ts'
import type { ArchiveFile } from '@/domain/assembly-votes/archive-file.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'
import { parseRawJson } from '@/domain/raw-parsing.ts'

/** The author types that name a deputy; the government's amendments are left out. */
const DEPUTY_AUTHOR_TYPES = new Set(['Député', 'Rapporteur'])
const RAPPORTEUR_AUTHOR_TYPE = 'Rapporteur'

/** `json/<legislative file>/<text>/<uid>.json`: the file is in the path only. */
const LEGISLATIVE_FILE_IN_PATH = /^json\/(DLR[^/]+)\//

const isoDateSchema = z.iso.date()

/** One amendment as read from the zip, before the scrutins are matched. */
export type AmendmentEntry = {
  /** `null` when no deputy signed it first: the government's. */
  authorId: string | null
  cosignerIds: readonly string[]
  linkable: LinkableAmendment
  tabled: Omit<TabledAmendment, 'scrutin'>
}

export type AmendmentDatasets = {
  deputyAmendments: DeputyAmendments[]
  legislativeFileTitles: LegislativeFileTitles
  report: {
    amendments: number
    linkedToScrutins: number
    /** Authored by an actor `deputies.json` does not hold: left out. */
    unknownAuthors: number
  }
}

/** `2026-01-29`, or `null` for the few left blank. */
const toDepositDate = (text: string | null): string | null => {
  if (text === null) return null
  const date = isoDateSchema.safeParse(text.slice(0, 10))
  return date.success ? date.data : null
}

/** Reads one file of the amendments zip. */
export const readAmendmentFile = (
  file: ArchiveFile
): Result<AmendmentEntry, IngestError> => {
  const parsed = parseRawJson(file.text, rawAmendmentFileSchema, file.path)
  if (parsed.status === 'failure') return parsed
  const {
    corps,
    cycleDeVie,
    discussionIdentique,
    identification,
    pointeurFragmentTexte,
    seanceDiscussionRef,
    signataires,
    uid
  } = parsed.data.amendement
  const { acteurRef, typeAuteur } = signataires.auteur
  const number = identification.numeroLong
  const organ = identification.prefixeOrganeExamen
  const outcome = toAmendmentOutcome({
    sort: cycleDeVie.sort,
    stateCode: cycleDeVie.etatDesTraitements.etat.code
  })

  return Result.success({
    authorId: DEPUTY_AUTHOR_TYPES.has(typeAuteur) ? acteurRef : null,
    cosignerIds: signataires.cosignataires?.acteurRef ?? [],
    linkable: {
      identicalDiscussionId: discussionIdentique?.idDiscussion ?? null,
      number,
      outcome,
      sittingId: seanceDiscussionRef,
      uid
    },
    tabled: {
      article:
        pointeurFragmentTexte?.division?.articleDesignationCourte ?? null,
      asRapporteur: typeAuteur === RAPPORTEUR_AUTHOR_TYPE,
      date: toDepositDate(cycleDeVie.dateDepot),
      legislativeFileId: file.path.match(LEGISLATIVE_FILE_IN_PATH)?.[1] ?? null,
      number,
      officialPath: officialAmendmentPath({ number, organ, uid }),
      organ,
      outcome,
      summary: toAmendmentSummary(corps?.contenuAuteur?.exposeSommaire ?? null)
    }
  })
}

/** Newest first; a blank date last. The uid breaks ties, in tabling order reversed. */
const newestFirst = (left: AmendmentEntry, right: AmendmentEntry): number =>
  (right.tabled.date ?? '').localeCompare(left.tabled.date ?? '') ||
  right.linkable.uid.localeCompare(left.linkable.uid)

/**
 * Every deputy's amendments, each matched with the scrutin that decided it,
 * and the titles of the files they belong to. Every deputy gets a file, even
 * with nothing tabled.
 */
export const toAmendmentDatasets = ({
  deputyIds,
  entries,
  legislativeFileTitles,
  scrutins
}: {
  deputyIds: readonly DeputyId[]
  entries: readonly AmendmentEntry[]
  legislativeFileTitles: ReadonlyMap<string, string>
  scrutins: readonly LinkableScrutin[]
}): AmendmentDatasets => {
  const links = toScrutinLinks({
    amendments: entries.map((entry) => entry.linkable),
    scrutins
  })
  const entriesByDeputy = new Map<string, AmendmentEntry[]>(
    deputyIds.map((deputyId) => [deputyId, []])
  )
  const cosignedByDeputy = new Map<string, number>(
    deputyIds.map((deputyId) => [deputyId, 0])
  )
  let unknownAuthors = 0
  for (const entry of entries) {
    for (const cosignerId of entry.cosignerIds) {
      const cosigned = cosignedByDeputy.get(cosignerId)
      if (cosigned !== undefined) cosignedByDeputy.set(cosignerId, cosigned + 1)
    }
    if (entry.authorId === null) continue
    const authored = entriesByDeputy.get(entry.authorId)
    if (authored === undefined) unknownAuthors += 1
    else authored.push(entry)
  }

  const citedFileIds = new Set<string>()
  const deputyAmendments = deputyIds.map((deputyId) => {
    const amendments = (entriesByDeputy.get(deputyId) ?? [])
      .toSorted(newestFirst)
      .map((entry) => {
        if (entry.tabled.legislativeFileId !== null) {
          citedFileIds.add(entry.tabled.legislativeFileId)
        }
        return {
          ...entry.tabled,
          scrutin: links.get(entry.linkable.uid) ?? null
        }
      })
    return {
      amendments,
      cosignedCount: cosignedByDeputy.get(deputyId) ?? 0,
      deputyId
    }
  })

  return {
    deputyAmendments,
    legislativeFileTitles: [...citedFileIds].sort().flatMap((id) => {
      const title = legislativeFileTitles.get(id)
      return title === undefined ? [] : [{ id, title }]
    }),
    report: {
      amendments: deputyAmendments.reduce(
        (total, record) => total + record.amendments.length,
        0
      ),
      linkedToScrutins: deputyAmendments.reduce(
        (total, record) =>
          total +
          record.amendments.filter((amendment) => amendment.scrutin !== null)
            .length,
        0
      ),
      unknownAuthors
    }
  }
}
