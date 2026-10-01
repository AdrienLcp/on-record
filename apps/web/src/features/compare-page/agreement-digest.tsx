import type React from 'react'

import { TextButton } from '@/presentation/components/ui/text-button'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { RichText } from '@/presentation/i18n/rich-text'

import type { Agreement, ComparedKind, ComparedParty } from './party-comparison'

import './agreement-digest.sass'

type AgreementDigestProps = {
  agreement: Agreement
  kind: ComparedKind
  onAgreementChange: (agreement: Agreement) => void
  parties: readonly ComparedParty[]
  splitCount: number
  togetherCount: number
}

/**
 * How often the compared parties stood together, in one sentence, with the
 * actions that list those votes or the others.
 */
export const AgreementDigest: React.FC<AgreementDigestProps> = ({
  agreement,
  kind,
  onAgreementChange,
  parties,
  splitCount,
  togetherCount
}) => {
  const translate = useTranslate()
  const [first, second] = parties
  const figures = {
    figure: (children: React.ReactNode) => (
      <strong className='agreement-figure' key='figure'>
        {children}
      </strong>
    ),
    together: togetherCount,
    total: togetherCount + splitCount
  }

  return (
    <section
      aria-label={translate('compare.digest.label')}
      className='agreement-digest'
    >
      <p className='agreement-line'>
        <RichText
          parts={
            parties.length === 2 && first !== undefined && second !== undefined
              ? translate.rich(`compare.digest.pair.${kind}`, {
                  ...figures,
                  first: (children) => <strong key='first'>{children}</strong>,
                  firstName: translate(`party.names.${first.party.id}`),
                  second: (children) => (
                    <strong key='second'>{children}</strong>
                  ),
                  secondName: translate(`party.names.${second.party.id}`)
                })
              : translate.rich(`compare.digest.every.${kind}`, {
                  ...figures,
                  count: parties.length
                })
          }
        />
      </p>
      <p className='agreement-actions'>
        {agreement !== 'together' && togetherCount > 0 && (
          <TextButton onPress={() => onAgreementChange('together')}>
            {translate('compare.digest.showTogether', { count: togetherCount })}
          </TextButton>
        )}
        {agreement !== 'split' && splitCount > 0 && (
          <TextButton onPress={() => onAgreementChange('split')}>
            {translate('compare.digest.showSplit', { count: splitCount })}
          </TextButton>
        )}
        {agreement !== 'all' && (
          <TextButton onPress={() => onAgreementChange('all')}>
            {translate('compare.digest.showAll')}
          </TextButton>
        )}
      </p>
    </section>
  )
}
