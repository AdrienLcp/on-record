import type { ScrutinDetail } from '@on-record/protocol/assembly/scrutin.ts'

import { LEGISLATURE_CODE } from '@/domain/assembly-votes/assembly-sources.ts'
import type {
  RawAct,
  RawLegislativeFile
} from '@/domain/assembly-votes/raw-legislative-file.ts'

/** How a file cites an Assemblée scrutin of this legislature; other legislatures and `VTSN…` refs are left out. */
const ASSEMBLY_VOTE_REF = new RegExp(`^VTANR5L${LEGISLATURE_CODE}V(\\d+)$`)

const voteRefsOf = (acts: readonly RawAct[]): string[] =>
  acts.flatMap((act) => [...act.voteRefs, ...voteRefsOf(act.actesLegislatifs)])

/** Scrutin number → the legislative files whose steps cite it. */
export const filesByScrutinNumber = (
  files: readonly RawLegislativeFile[]
): Map<number, Set<string>> => {
  const filesByNumber = new Map<number, Set<string>>()
  for (const file of files) {
    for (const voteRef of voteRefsOf(file.actesLegislatifs)) {
      const digits = voteRef.match(ASSEMBLY_VOTE_REF)?.[1]
      if (digits === undefined) continue
      const number = Number(digits)
      const fileIds = filesByNumber.get(number) ?? new Set<string>()
      fileIds.add(file.uid)
      filesByNumber.set(number, fileIds)
    }
  }
  return filesByNumber
}

/**
 * Gives a scrutin that names no legislative file the one file citing it.
 * Most scrutins before 2026 name none. A scrutin cited by two files keeps
 * none: a motion of censure is cited by the bill and by the government's
 * commitment on it.
 */
export const withLegislativeFiles = ({
  files,
  scrutins
}: {
  files: readonly RawLegislativeFile[]
  scrutins: readonly ScrutinDetail[]
}): ScrutinDetail[] => {
  const filesByNumber = filesByScrutinNumber(files)
  return scrutins.map((scrutin) => {
    const citingFiles = [...(filesByNumber.get(scrutin.number) ?? [])]
    return scrutin.legislativeFileId === null && citingFiles.length === 1
      ? { ...scrutin, legislativeFileId: citingFiles[0] ?? null }
      : scrutin
  })
}
