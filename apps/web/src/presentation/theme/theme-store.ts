import { createThemePreferenceStore } from '@adrienlcp/theme-preference'

/** Where the chosen theme is kept on the device, as the legal page lists it. */
export const THEME_STORAGE_KEY = 'on-record:theme'

/** Shared by the switch and by the Vite plugin that inlines the pre-paint script. */
export const themeStore = createThemePreferenceStore({
  storageKey: THEME_STORAGE_KEY
})
