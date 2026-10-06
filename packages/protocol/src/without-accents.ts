const DIACRITICS = /\p{Diacritic}/gu

/** The text with its accents dropped and its letters kept: `Lefèvre` → `Lefevre`. */
export const withoutAccents = (text: string): string =>
  text.normalize('NFD').replace(DIACRITICS, '')
