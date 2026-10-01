import type { Group } from '@on-record/protocol/assembly/group.ts'

import type { RawGroup } from '@/domain/assembly-votes/raw-organ.ts'

/** A group's organ file → the published group. */
export const toGroup = (organ: RawGroup): Group => ({
  color: organ.couleurAssociee,
  from: organ.viMoDe.dateDebut,
  id: organ.uid,
  name: organ.libelle,
  shortName: organ.libelleAbrege,
  to: organ.viMoDe.dateFin
})
