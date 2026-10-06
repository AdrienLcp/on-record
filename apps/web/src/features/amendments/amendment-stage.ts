/** The organ code the open data gives an amendment tabled for the sitting. */
const SITTING_ORGAN = 'AN'

/** The standing committees the site names; any other code reads as a committee. */
const STANDING_COMMITTEES = {
  CION_AFETR: 'foreignAffairs',
  CION_DEF: 'defence',
  CION_FIN: 'finance',
  CION_LOIS: 'law',
  'CION-CEDU': 'culture',
  'CION-DVP': 'sustainableDevelopment',
  'CION-ECO': 'economy',
  'CION-SOC': 'socialAffairs'
} as const

/** Special committees, set up for one text, carry codes starting this way: `CSVIEECO`. */
const SPECIAL_COMMITTEE_PREFIX = 'CS'

/**
 * Where an amendment was tabled: the sitting, a named standing committee, a
 * special committee, or a committee the site has no name for.
 */
export type AmendmentStage =
  | (typeof STANDING_COMMITTEES)[keyof typeof STANDING_COMMITTEES]
  | 'otherCommittee'
  | 'sitting'
  | 'specialCommittee'

const isStandingCommittee = (
  organ: string
): organ is keyof typeof STANDING_COMMITTEES => organ in STANDING_COMMITTEES

export const stageOf = (organ: string): AmendmentStage => {
  if (organ === SITTING_ORGAN) {
    return 'sitting'
  }

  if (isStandingCommittee(organ)) {
    return STANDING_COMMITTEES[organ]
  }

  return organ.startsWith(SPECIAL_COMMITTEE_PREFIX)
    ? 'specialCommittee'
    : 'otherCommittee'
}

export const isSittingOrgan = (organ: string): boolean =>
  organ === SITTING_ORGAN
