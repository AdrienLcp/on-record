import { Result } from '@adrienlcp/result'

import type {
  Deputy,
  GroupMembership
} from '@on-record/protocol/assembly/deputy.ts'

import { toGroupMemberships } from '@/domain/assembly-votes/group-at-date.ts'
import { withoutWaitForGroups } from '@/domain/assembly-votes/group-formation-wait.ts'
import type {
  RawDeputy,
  RawMandate
} from '@/domain/assembly-votes/raw-actor.ts'
import type { IngestError } from '@/domain/ingest-errors.ts'

type SeatMandate = Extract<RawMandate, { kind: 'seat' }>
type GroupMandate = Extract<RawMandate, { kind: 'group' }>

const genderByCivility = {
  'M.': 'male',
  Mme: 'female'
} as const satisfies Record<
  RawDeputy['etatCivil']['ident']['civ'],
  Deputy['gender']
>

const isSeat = (mandate: RawMandate): mandate is SeatMandate =>
  mandate.kind === 'seat'

const isGroupMandate = (mandate: RawMandate): mandate is GroupMandate =>
  mandate.kind === 'group'

const seatStart = (seat: SeatMandate): string =>
  seat.mandature.datePriseFonction ?? seat.dateDebut

const toMembership = (mandate: GroupMandate): GroupMembership => ({
  from: mandate.dateDebut,
  groupId: mandate.organes.organeRef,
  to: mandate.dateFin
})

/** A deputy's actor file → the published deputy; the constituency is the latest seat's. */
export const toDeputy = (actor: RawDeputy): Result<Deputy, IngestError> => {
  const id = actor.uid['#text']
  const seats = actor.mandats.mandat
    .filter(isSeat)
    .toSorted((left, right) => seatStart(left).localeCompare(seatStart(right)))
  const latestSeat = seats.at(-1)
  if (latestSeat === undefined) {
    return Result.failure({ code: 'missing_seat', deputyId: id })
  }

  const { ident } = actor.etatCivil
  const place = latestSeat.election.lieu

  return Result.success({
    birthDate: actor.etatCivil.infoNaissance.dateNais,
    constituency: place.numCirco,
    department: { code: place.numDepartement, name: place.departement },
    firstName: ident.prenom,
    gender: genderByCivility[ident.civ],
    groups: withoutWaitForGroups(
      toGroupMemberships(
        actor.mandats.mandat.filter(isGroupMandate).map(toMembership)
      )
    ),
    hatvpUrl: actor.uri_hatvp,
    id,
    lastName: ident.nom,
    mandates: seats.map((seat) => ({
      from: seatStart(seat),
      to: seat.dateFin
    })),
    profession: actor.profession.libelleCourant
  })
}
