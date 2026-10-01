import {
  isThemePreference,
  THEME_PREFERENCES
} from '@adrienlcp/theme-preference'
import { useThemePreference } from '@adrienlcp/theme-preference/react'
import type React from 'react'

import {
  ToggleButton,
  ToggleButtonGroup
} from '@/presentation/components/ui/toggle-button-group'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { themeStore } from './theme-store'

import './theme-switch.sass'

export const ThemeSwitch: React.FC = () => {
  const translate = useTranslate()
  const { preference, setPreference } = useThemePreference(themeStore)

  return (
    <ToggleButtonGroup
      aria-label={translate('theme.label')}
      className='theme-switch'
      onSelectionChange={(keys) => {
        const [chosen] = keys

        if (isThemePreference(chosen)) {
          setPreference(chosen)
        }
      }}
      selectedKeys={[preference]}
    >
      {THEME_PREFERENCES.map((themePreference) => (
        <ToggleButton id={themePreference} key={themePreference}>
          {translate(`theme.${themePreference}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
