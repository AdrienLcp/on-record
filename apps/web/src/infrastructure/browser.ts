/**
 * The browser sends Global Privacy Control: the visitor refused measurement
 * once, for every site. Not in TypeScript's DOM types yet.
 */
export const sendsGlobalPrivacyControl = (): boolean =>
  typeof navigator !== 'undefined' &&
  'globalPrivacyControl' in navigator &&
  navigator.globalPrivacyControl === true
