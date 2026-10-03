import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf, latestGroupIdOf } from '@/features/deputies/deputy'
import { scrutinSubjectText } from '@/features/scrutins/scrutin-subject-text'
import { scrutinTitleOf } from '@/features/scrutins/scrutin-title'
import { dateOfDay } from '@/infrastructure/dates'
import { translate } from '@/presentation/i18n/site-translator'

/**
 * What a served document says about itself before any script runs, beside
 * the `<title>` its page renders.
 */
export type PageHead = {
  /** The search snippet, and the line a shared link unfurls with. */
  description: string
}

/** A page whose head does not depend on a record. */
export type FixedPage =
  | 'compare'
  | 'deputies'
  | 'findMyDeputy'
  | 'groups'
  | 'home'
  | 'method'
  | 'scrutins'

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
  home: {
    description: translate('head.home')
  },
  method: {
    description: translate('head.method')
  },
  scrutins: {
    description: translate('head.scrutins')
  }
}

export const deputyHead = ({
  deputy,
  groups
}: {
  deputy: Deputy
  groups: readonly Group[]
}): PageHead => {
  const groupId = latestGroupIdOf(deputy)
  const group = groups.find(({ id }) => id === groupId)

  return {
    description: translate('head.deputy', {
      group: group?.name ?? translate('head.noGroup'),
      name: fullNameOf(deputy),
      seat: translate('deputy.constituency', {
        department: deputy.department.name,
        number: deputy.constituency
      })
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

/** A scrutin's tab names its subject: a number says nothing to a reader. */
export const scrutinPageTitle = (officialTitle: string): string =>
  scrutinSubjectText({ title: scrutinTitleOf(officialTitle), translate })

export const scrutinHead = (scrutin: ScrutinSummary): PageHead => ({
  description: translate('head.scrutin', {
    day: dateOfDay(scrutin.date),
    kind: translate(`head.scrutinKind.${scrutin.kind}`),
    outcome: translate(`head.outcome.${scrutin.outcome}`),
    title: shortenedAtAWord(scrutin.title)
  })
})
