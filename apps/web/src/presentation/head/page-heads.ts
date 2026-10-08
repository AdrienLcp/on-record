import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'
import type { SenateGroup } from '@on-record/protocol/senate/senate-group'
import type { SenateScrutinSummary } from '@on-record/protocol/senate/senate-scrutin'
import type { Senator } from '@on-record/protocol/senate/senator'

import { fullNameOf, latestGroupIdOf } from '@/features/deputies/deputy'
import { scrutinSubjectText } from '@/features/scrutins/scrutin-subject-text'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { senateScrutinTitleOf } from '@/features/senate-scrutins/senate-title'
import {
  latestSenateGroupIdOf,
  senatorFullNameOf
} from '@/features/senators/senator'
import { dateOfDay } from '@/infrastructure/dates'
import { SITE_ORIGIN } from '@/presentation/head/site-origin'
import { translate } from '@/presentation/i18n/site-translator'

/** A schema.org object, written into the document as JSON-LD. */
export type StructuredData = Record<string, unknown>

/**
 * What a served document says about itself before any script runs, beside
 * the `<title>` its page renders.
 */
export type PageHead = {
  /** The search snippet, and the line a shared link unfurls with. */
  description: string
  /** What the page is, for a crawler: a `Person` on a member's page. */
  structuredData?: StructuredData
}

/**
 * A member of a chamber, in the chamber and in the group they sit in last.
 * The datasets carry no portrait, so the person has no `image`.
 */
const memberPerson = ({
  chamber,
  group,
  name,
  path
}: {
  chamber: string
  group: { name: string; shortName: string } | undefined
  name: string
  path: string
}): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  memberOf: [
    { '@type': 'GovernmentOrganization', name: chamber },
    ...(group === undefined
      ? []
      : [
          {
            '@type': 'Organization',
            alternateName: group.shortName,
            name: group.name
          }
        ])
  ],
  name,
  url: `${SITE_ORIGIN}${path}`
})

/** A page whose head does not depend on a record. */
export type FixedPage =
  | 'compare'
  | 'deputies'
  | 'findMyDeputy'
  | 'groups'
  | 'method'
  | 'scrutins'
  | 'senateScrutins'
  | 'senators'
  | 'voteMatch'

/** The page first, then the site: on a phone only the start of a tab shows. */
export const documentTitleFor = (page: string): string =>
  `${page} — ${translate('common.siteName')}`

export const FIXED_PAGE_HEADS: Record<FixedPage, PageHead> = {
  compare: {
    description: translate('head.compare')
  },
  deputies: {
    description: translate('head.deputies')
  },
  findMyDeputy: {
    description: translate('head.findMyDeputy')
  },
  groups: {
    description: translate('head.groups')
  },
  method: {
    description: translate('head.method')
  },
  scrutins: {
    description: translate('head.scrutins')
  },
  senateScrutins: {
    description: translate('head.senateScrutins')
  },
  senators: {
    description: translate('head.senators')
  },
  voteMatch: {
    description: translate('head.voteMatch')
  }
}

export const deputyHead = ({
  deputy,
  groups,
  path
}: {
  deputy: Deputy
  groups: readonly Group[]
  /** Where the page is served, from the site root. */
  path: string
}): PageHead => {
  const groupId = latestGroupIdOf(deputy)
  const group = groups.find(({ id }) => id === groupId)
  const name = fullNameOf(deputy)

  return {
    description: translate('head.deputy', {
      group: group?.name ?? translate('head.noGroup'),
      name,
      seat: translate('deputy.constituency', {
        department: deputy.department.name,
        number: deputy.constituency
      })
    }),
    structuredData: memberPerson({
      chamber: translate('head.assembly'),
      group,
      name,
      path
    })
  }
}

export const groupHead = (group: Group): PageHead => ({
  description: translate('head.group', {
    name: group.name,
    shortName: group.shortName
  })
})

/** Long enough for any search snippet: an official title can run for lines. */
const SNIPPET_TITLE_LENGTH = 180

/** Quoted inside a sentence, so its own closing full stop goes. */
const shortenedAtAWord = (officialTitle: string): string => {
  const text = officialTitle.replace(/\.$/, '')

  if (text.length <= SNIPPET_TITLE_LENGTH) {
    return text
  }

  const cut = text.slice(0, SNIPPET_TITLE_LENGTH)

  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/**
 * A scrutin's tab leads with its subject, since a number alone says nothing to
 * a reader, then its number and day: a text is voted on more than once, every
 * motion of censure has the same subject, and two can fall on the same day.
 */
export const scrutinPageTitle = ({
  date,
  number,
  title
}: Pick<ScrutinSummary, 'date' | 'number' | 'title'>): string =>
  translate('head.scrutinPage', {
    day: dateOfDay(date),
    number,
    subject: scrutinSubjectText({ title: scrutinTitleOf(title), translate })
  })

export const scrutinHead = (scrutin: ScrutinSummary): PageHead => ({
  description: translate('head.scrutin', {
    day: dateOfDay(scrutin.date),
    kind: translate(`head.scrutinKind.${scrutin.kind}`),
    outcome: translate(`head.outcome.${scrutin.outcome}`),
    title: shortenedAtAWord(scrutin.title)
  })
})

export const senatorHead = ({
  groups,
  path,
  senator
}: {
  groups: readonly SenateGroup[]
  /** Where the page is served, from the site root. */
  path: string
  senator: Senator
}): PageHead => {
  const groupId = latestSenateGroupIdOf(senator)
  const group = groups.find(({ id }) => id === groupId)
  const name = senatorFullNameOf(senator)

  return {
    description: translate('head.senator', {
      constituency: senator.constituency.name,
      group: group?.name ?? translate('head.noGroup'),
      name
    }),
    structuredData: memberPerson({
      chamber: translate('head.senate'),
      group,
      name,
      path
    })
  }
}

/**
 * A senator's tab names the chamber: someone who left the Assemblée for the
 * Senate has a page in each, and both would otherwise carry the same title.
 */
export const senatorPageTitle = (name: string): string =>
  translate('head.senatorPage', { name })

/**
 * A Senate scrutin's tab names its subject, read as the Assemblée's would be,
 * its chamber, since both vote on the same texts, and its day.
 */
export const senateScrutinPageTitle = ({
  date,
  title
}: Pick<SenateScrutinSummary, 'date' | 'title'>): string =>
  translate('head.senateScrutinPage', {
    day: dateOfDay(date),
    subject: scrutinSubjectText({
      title: senateScrutinTitleOf(title),
      translate
    })
  })

export const senateScrutinHead = (scrutin: SenateScrutinSummary): PageHead => ({
  description: translate('head.senateScrutin', {
    day: dateOfDay(scrutin.date),
    kind: translate(`head.scrutinKind.${scrutin.kind}`),
    outcome: translate(`head.outcome.${scrutin.outcome}`),
    title: shortenedAtAWord(scrutin.title.replace(/^sur /, ''))
  })
})
