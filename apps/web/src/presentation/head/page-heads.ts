import type { Deputy } from '@on-record/protocol/assembly/deputy'
import type { Group } from '@on-record/protocol/assembly/group'
import type { ScrutinSummary } from '@on-record/protocol/assembly/scrutin'

import { fullNameOf, latestGroupIdOf } from '@/features/deputies/deputy'
import { dateOfDay } from '@/helpers/iso-day'
import { i18n } from '@/presentation/i18n/i18n'
import { LOCALE } from '@/presentation/i18n/locale'

/** What a served document says about itself before any script runs. */
export type PageHead = {
  /** The search snippet, and the line a shared link unfurls with. */
  description: string
  /** The browser tab, the search result, the unfurl. */
  title: string
}

/** A page whose head does not depend on a record. */
export type FixedPage =
  | 'deputies'
  | 'findMyDeputy'
  | 'groups'
  | 'home'
  | 'method'
  | 'scrutins'

const translate = i18n.translator(LOCALE)

/** The page first, then the site: on a phone only the start of a tab shows. */
export const documentTitleFor = (page: string): string =>
  `${page} — ${translate('common.siteName')}`

/**
 * Each title is the one the page's `useDocumentTitle` writes, so the tab does
 * not change once the page hydrates.
 */
export const FIXED_PAGE_HEADS: Record<FixedPage, PageHead> = {
  deputies: {
    description: translate('head.deputies'),
    title: documentTitleFor(translate('deputies.title'))
  },
  findMyDeputy: {
    description: translate('head.findMyDeputy'),
    title: documentTitleFor(translate('findMyDeputy.title'))
  },
  groups: {
    description: translate('head.groups'),
    title: documentTitleFor(translate('groups.title'))
  },
  home: {
    description: translate('head.home'),
    title: documentTitleFor(translate('home.title'))
  },
  method: {
    description: translate('head.method'),
    title: documentTitleFor(translate('method.title'))
  },
  scrutins: {
    description: translate('head.scrutins'),
    title: documentTitleFor(translate('scrutins.title'))
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
    }),
    title: documentTitleFor(fullNameOf(deputy))
  }
}

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

export const scrutinHead = (scrutin: ScrutinSummary): PageHead => ({
  description: translate('head.scrutin', {
    day: dateOfDay(scrutin.date),
    kind: translate(`head.scrutinKind.${scrutin.kind}`),
    outcome: translate(`head.outcome.${scrutin.outcome}`),
    title: shortenedAtAWord(scrutin.title)
  }),
  title: documentTitleFor(
    translate('scrutin.reference', { number: scrutin.number })
  )
})
