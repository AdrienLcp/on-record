import { z } from 'zod'

import { repairMojibake } from '@/domain/senate-votes/repair-mojibake.ts'

/** `character(n)` columns come padded with spaces. */
const code = z.string().transform((value) => value.trim())

/** Prose: repaired punctuation, line breaks and runs of spaces folded. */
const prose = z
  .string()
  .transform((value) => repairMojibake(value).replace(/\s+/g, ' ').trim())

/** Every date of the dumps is a timestamp at midnight: the day is all it holds. */
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2} /)
  .transform((value) => value.slice(0, 10))

const count = z
  .string()
  .regex(/^\d+$/)
  .transform((digits) => Number(digits))

/** `scr`: one row per scrutin. */
export const rawScrutinRowSchema = z.object({
  /** Key into `date_seance.code`, leading to the bill. */
  code: code.nullable(),
  scrcon: count,
  scrdat: day,
  scrint: prose,
  scrnum: count,
  scrpou: count,
  /** For plus against: the votes cast that count towards the majority. */
  scrsuf: count,
  /** For, against and abstention. */
  scrvot: count,
  sesann: count
})

/**
 * `votsen`: one row per senator per scrutin. `posvotcod` 1 for, 2 against,
 * 3 abstention, 4 no part taken; `stavotidt` 8 presiding the sitting,
 * 9 member of the government, 12 recusal; `votsenmar` `*` when the senator
 * made a "mise au point".
 */
export const rawSenatorBallotRowSchema = z.object({
  posvotcod: z.enum(['1', '2', '3', '4']),
  scrnum: count,
  senmat: code,
  /** The senator holding the delegation, when the ballot was cast by one. */
  senmatdel: code.nullable(),
  sesann: count,
  stavotidt: z.enum(['0', '8', '9', '12']),
  votsenmar: code.nullable()
})

/** `corscr`: the sentences of the official report announcing "mises au point". */
export const rawCorrectionRowSchema = z.object({
  corscrtxt: prose,
  scrnum: count,
  sesann: count
})

/** `date_seance`: a sitting day of one reading. */
export const rawSittingRowSchema = z.object({
  code: code,
  lecidt: code.nullable()
})

/** `lecass`: a reading in one chamber. */
export const rawChamberReadingRowSchema = z.object({
  lecassidt: code,
  lecidt: code.nullable()
})

/** `lecture`: one reading of a bill. */
export const rawReadingRowSchema = z.object({
  lecidt: code,
  loicod: code.nullable()
})

/** `loi`: a bill, the Senate's legislative file. */
export const rawBillRowSchema = z.object({
  loicod: code,
  /** Short name, « Budget 2025 ». */
  loient: prose.nullable(),
  /** Path of the file's page on senat.fr. */
  signet: code.nullable()
})

/** `sen`: one row per person who ever sat. */
export const rawSenatorRowSchema = z.object({
  quacod: z.enum(['M.', 'Mlle', 'Mme']),
  sendaiurl: code.nullable(),
  sendatnai: day.nullable(),
  sendespro: prose.nullable(),
  senmat: code,
  sennomuse: prose,
  senprenomuse: prose
})

/** `elusen`: one seat mandate. */
export const rawSeatRowSchema = z.object({
  dptnum: code,
  eludatdeb: day,
  eludatfin: day.nullable(),
  senmat: code
})

/** `memgrppol`: one membership of a political group. */
export const rawGroupMembershipRowSchema = z.object({
  grppolcod: code,
  memgrppoldatdeb: day.nullable(),
  memgrppoldatfin: day.nullable(),
  senmat: code
})

/** `grppol`: a political group, by its lasting code. */
export const rawGroupRowSchema = z.object({
  grppolcod: code,
  /** Short name: « RDPI ». */
  grppolliccou: prose,
  /** Full name, the one the official report uses: « Groupe du Rassemblement Démocratique et Social Européen ». */
  grppollilcou: prose
})

/** `dpt`: a constituency, by the Senate's own number. */
export const rawConstituencyRowSchema = z.object({
  dptcod: code,
  dptlib: prose,
  dptnum: code
})

export type RawBillRow = z.infer<typeof rawBillRowSchema>
export type RawChamberReadingRow = z.infer<typeof rawChamberReadingRowSchema>
export type RawConstituencyRow = z.infer<typeof rawConstituencyRowSchema>
export type RawCorrectionRow = z.infer<typeof rawCorrectionRowSchema>
export type RawGroupMembershipRow = z.infer<typeof rawGroupMembershipRowSchema>
export type RawGroupRow = z.infer<typeof rawGroupRowSchema>
export type RawReadingRow = z.infer<typeof rawReadingRowSchema>
export type RawScrutinRow = z.infer<typeof rawScrutinRowSchema>
export type RawSeatRow = z.infer<typeof rawSeatRowSchema>
export type RawSenatorBallotRow = z.infer<typeof rawSenatorBallotRowSchema>
export type RawSenatorRow = z.infer<typeof rawSenatorRowSchema>
export type RawSittingRow = z.infer<typeof rawSittingRowSchema>
