import type {
  DeclaredItem,
  InterestSections,
  OwnSection,
  ThirdPartySection
} from '@on-record/protocol/hatvp/hatvp-record.ts'

import type {
  RawDeclaredItem,
  RawInterestsDeclaration,
  RawSection
} from '@/domain/hatvp/raw-interests-declaration.ts'

/** What the HATVP writes in place of a value it does not publish. */
const WITHHELD_MARK = '[Données non publiées]'

/** A declared text as it reads: spaces collapsed, the withheld mark removed, `null` when nothing is left. */
export const declaredTextOf = (value: string | undefined): string | null => {
  const text = (value ?? '')
    .replaceAll(WITHHELD_MARK, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text === '' ? null : text
}

/** `08/2024` → `2024-08`; anything else is left out. */
export const declaredMonthOf = (value: string | undefined): string | null => {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec((value ?? '').trim())
  return match === null ? null : `${match[2]}-${match[1]}`
}

type ItemFields = {
  label: keyof RawDeclaredItem
  organisation?: keyof RawDeclaredItem
}

const toItem = (
  item: RawDeclaredItem,
  { label, organisation }: ItemFields
): DeclaredItem => ({
  from: declaredMonthOf(item.dateDebut),
  isKept: item.conservee === 'true',
  label: declaredTextOf(item[label]),
  organisation:
    organisation === undefined ? null : declaredTextOf(item[organisation]),
  to: declaredMonthOf(item.dateFin)
})

const ownSection = (section: RawSection, fields: ItemFields): OwnSection =>
  section.neant
    ? { status: 'none' }
    : {
        items: section.items.map((item) => toItem(item, fields)),
        status: 'listed'
      }

/** About other people: how many are declared, never who. */
const thirdPartySection = (section: RawSection): ThirdPartySection =>
  section.neant
    ? { status: 'none' }
    : { count: section.items.length, status: 'listed' }

/**
 * A declaration of interests, section by section: « néant » when declared
 * empty, the declarant's own lines as written, and only a count for the
 * spouse's activities and the collaborators, who are third parties.
 */
export const toInterestSections = ({
  declaration
}: RawInterestsDeclaration): InterestSections => ({
  collaborators: thirdPartySection(declaration.activCollaborateursDto),
  consulting: ownSection(declaration.activConsultantDto, {
    label: 'description',
    organisation: 'nomEmployeur'
  }),
  electedOffices: ownSection(declaration.mandatElectifDto, {
    label: 'descriptionMandat'
  }),
  governingBodies: ownSection(declaration.participationDirigeantDto, {
    label: 'activite',
    organisation: 'nomSociete'
  }),
  observations: ownSection(declaration.observationInteretDto, {
    label: 'contenu'
  }),
  recentActivities: ownSection(declaration.activProfCinqDerniereDto, {
    label: 'description',
    organisation: 'employeur'
  }),
  shareholdings: ownSection(declaration.participationFinanciereDto, {
    label: 'nomSociete'
  }),
  spouseActivities: thirdPartySection(declaration.activProfConjointDto),
  volunteerRoles: ownSection(declaration.fonctionBenevoleDto, {
    label: 'descriptionActivite',
    organisation: 'nomStructure'
  })
})
