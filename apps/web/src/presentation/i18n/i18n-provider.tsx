import { createSafeContext } from '@adrienlcp/react'
import type React from 'react'

import { I18nProvider as ReactAriaI18nProvider } from '@/presentation/components/ui/i18n-provider'

import { i18n } from './i18n'
import { LOCALE } from './locale'
import { REGIONAL_LOCALES } from './regional-locales'
import type { Translate } from './translation'

type I18nContextValue = {
  translate: Translate
}

export const [I18nContext, useI18n] =
  createSafeContext<I18nContextValue>('I18nProvider')

export const useTranslate = (): Translate => useI18n().translate

type I18nProviderProps = {
  children: React.ReactNode
}

/** One locale, so nothing to switch: the provider only hands the translator down. */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => (
  <I18nContext value={{ translate: i18n.translator(LOCALE) }}>
    <ReactAriaI18nProvider locale={REGIONAL_LOCALES[LOCALE]}>
      {children}
    </ReactAriaI18nProvider>
  </I18nContext>
)
