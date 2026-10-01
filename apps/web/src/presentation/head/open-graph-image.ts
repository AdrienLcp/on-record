/**
 * The share card every page unfurls with, committed in `public/`. Its size is
 * announced in each document's head and is the size the file was shot at; one
 * card for the whole site, so one alt text, written into `index.html` by the
 * share card plugin rather than kept in the dictionary no script reads there.
 */
export const OPEN_GRAPH_IMAGE = {
  alt: 'on-record : une fiche de registre sur un bureau gris-bleu, avec la phrase « Comment votent les députés, scrutin par scrutin. »',
  height: 630,
  path: '/og.png',
  width: 1200
} as const
