import type {
  Ballot,
  Correction,
  GroupVote,
  ScrutinDetail,
  ScrutinSummary
} from '@on-record/protocol/assembly/scrutin.ts'
import type { BallotPosition } from '@on-record/protocol/votes/ballot-position.ts'
import type { ScrutinKind } from '@on-record/protocol/votes/scrutin-kind.ts'
import type { ScrutinOutcome } from '@on-record/protocol/votes/scrutin-outcome.ts'
import type { VoteTotals } from '@on-record/protocol/votes/vote-totals.ts'

import type {
  RawGroupVote,
  RawScrutin,
  RawVoteCount
} from '@/domain/assembly-votes/raw-scrutin.ts'

type ScrutinTypeCode = RawScrutin['typeVote']['codeTypeVote']
type OutcomeCode = RawScrutin['sort']['code']

const scrutinKindByTypeCode = {
  MOC: 'censure',
  SPO: 'ordinary',
  SPS: 'solemn'
} as const satisfies Record<ScrutinTypeCode, ScrutinKind>

const outcomeBySortCode = {
  adopté: 'adopted',
  rejeté: 'rejected'
} as const satisfies Record<OutcomeCode, ScrutinOutcome>

const toVoteTotals = (count: RawVoteCount): VoteTotals => ({
  abstention: count.abstentions,
  against: count.contre,
  for: count.pour,
  nonVoting: count.nonVotants
})

const EXPRESSED_POSITIONS = ['for', 'against', 'abstention'] as const

/**
 * The choice most of the group's voting members made, `null` on a tie or when
 * none voted. Computed rather than read from `positionMajoritaire`, which
 * contradicts the group's own counts on 3% of positions and is shown nowhere
 * on the Assemblée's site.
 */
export const majorityPositionOf = (
  totals: VoteTotals
): BallotPosition | null => {
  const largest = Math.max(...EXPRESSED_POSITIONS.map((each) => totals[each]))
  const leaders = EXPRESSED_POSITIONS.filter((each) => totals[each] === largest)
  const [leader] = leaders

  return largest > 0 && leaders.length === 1 && leader !== undefined
    ? leader
    : null
}

const toGroupVote = (group: RawGroupVote): GroupVote => {
  const lists = group.vote.decompteNominatif
  const totals = toVoteTotals(group.vote.decompteVoix)
  const recordedLists = [
    { position: 'for', voters: lists.pours },
    { position: 'against', voters: lists.contres },
    { position: 'abstention', voters: lists.abstentions },
    { position: 'nonVoting', voters: lists.nonVotants }
  ] as const

  return {
    ballots: recordedLists.flatMap(({ position, voters }) =>
      voters.map(
        (voter): Ballot => ({
          byDelegation: voter.parDelegation,
          cause: voter.causePositionVote,
          deputyId: voter.acteurRef,
          position
        })
      )
    ),
    groupId: group.organeRef,
    majorityPosition: majorityPositionOf(totals),
    memberCount: group.nombreMembresGroupe,
    totals
  }
}

const toCorrections = (declared: RawScrutin['miseAuPoint']): Correction[] => {
  const malfunction = declared.dysfonctionnement
  const declaredLists = [
    { intended: 'for', voters: declared.pours },
    { intended: 'against', voters: declared.contres },
    { intended: 'abstention', voters: declared.abstentions },
    { intended: 'nonVoting', voters: declared.nonVotants },
    { intended: 'nonVoting', voters: declared.nonVotantsVolontaires },
    { intended: 'for', voters: malfunction.pour },
    { intended: 'against', voters: malfunction.contre },
    { intended: 'abstention', voters: malfunction.abstentions },
    { intended: 'nonVoting', voters: malfunction.nonVotants },
    { intended: 'nonVoting', voters: malfunction.nonVotantsVolontaires }
  ] as const

  return declaredLists.flatMap(({ intended, voters }) =>
    voters.map((voter): Correction => ({ deputyId: voter.acteurRef, intended }))
  )
}

/** One official scrutin file → the published detail of that scrutin. */
export const toScrutinDetail = (scrutin: RawScrutin): ScrutinDetail => ({
  corrections: toCorrections(scrutin.miseAuPoint),
  date: scrutin.dateScrutin,
  groups: scrutin.ventilationVotes.organe.groupes.groupe.map(toGroupVote),
  kind: scrutinKindByTypeCode[scrutin.typeVote.codeTypeVote],
  legislativeFileId: scrutin.objet.dossierLegislatif?.dossierRef ?? null,
  number: scrutin.numero,
  outcome: outcomeBySortCode[scrutin.sort.code],
  requester: scrutin.demandeur.texte,
  title: scrutin.titre,
  totals: toVoteTotals(scrutin.syntheseVote.decompte)
})

/** The detail without what only the scrutin page needs. */
export const toScrutinSummary = (detail: ScrutinDetail): ScrutinSummary => ({
  date: detail.date,
  kind: detail.kind,
  legislativeFileId: detail.legislativeFileId,
  number: detail.number,
  outcome: detail.outcome,
  title: detail.title,
  totals: detail.totals
})
