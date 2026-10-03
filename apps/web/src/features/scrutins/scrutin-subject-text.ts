import type { Translate } from '@/presentation/i18n/translation'

import type { ScrutinTitle } from './scrutin-title'

/** What a scrutin was about, in the fewest words its official title allows. */
export const scrutinSubjectText = ({
  title,
  translate
}: {
  title: ScrutinTitle
  translate: Translate
}): string => {
  switch (title.kind) {
    case 'censure':
      return translate(
        title.afterForcedAdoption
          ? 'scrutinTitle.censure.afterForcedAdoption'
          : 'scrutinTitle.censure.plain'
      )
    case 'other':
      return title.subject
    case 'text':
      return title.subject ?? translate('scrutinTitle.specialLaw')
  }
}
