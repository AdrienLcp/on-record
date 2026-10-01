# 04 — Web shell

Goal: the frame every page lives in, with one real page proving data loads.

## Read first

`toolkit/conventions/architecture.md`, `routing.md`, `i18n.md`, `sass.md`,
`react-components.md`, `requests.md`. **Start with the `impeccable` skill**
before any markup or style: the visual direction is set here.

## Do

1. Router in data mode, `src/infrastructure/router/` only.
2. `@adrienlcp/i18n` with a French reference dictionary
   (`dictionary-fr.ts`); keys in English, namespaced by feature. Official
   data (names, titles) is data, not dictionary keys.
3. Theme with `@adrienlcp/theme-preference`, `oklch()` semantic tokens;
   official group colours come from the data, checked for contrast in both
   themes.
4. App shell: header, footer citing the source and its licence, a "how to
   read this site" link (editorial principles in plain words).
5. `src/infrastructure/api/datasets.ts`: fetch a dataset, parse it with its
   protocol schema, return a Result; abort superseded requests.
6. Dev loads datasets from `.data/` (a Vite alias or a dev-only static dir).
7. First page: list of groups with their member count, to prove the chain.

## Design direction to settle in impeccable

Sober, readable, institutional without being official-looking (it must not
pass for an Assemblée site). Mobile first: most visits will come from a link
shared on a phone.

## Done when

- The groups page renders real data in a browser, light and dark, at phone
  width and desktop.
- A dataset that fails to parse shows an error state, not a blank page.

## Done — 2026-10-01

- Router in data mode (`infrastructure/router/`): `routes.tsx` exports the
  tree (lazy pages, a `loaderFor` table that alone reads URL params, loaders
  take plain values and forward `request.signal`), `browser-router.tsx`,
  `root-route.tsx` (root loader for `meta.json`, focus to `<main>` on path
  change, scroll restoration keyed by path for full loads). List filters live
  in the query string (`useSearchValue`); routes only revalidate when the
  pathname changes. Ready for the prerender of step 08.
- `infrastructure/api/datasets-api.ts`: `createDatasetReader(schema)` fetches
  `/data/<datasetPaths entry>`, parses with the protocol schema, returns
  `Result<T, 'aborted' | 'missing' | 'network' | 'invalid'>` and keeps parsed
  files for the visit (the 2.9 MB scrutin index is read once).
  Deviation: `'missing'` added for a 404 (unknown deputy or scrutin).
- Datasets in dev: `scripts/datasets-plugin.ts` serves the repo's `.data/` at
  `/data` (404 for a missing file, never the SPA fallback); `vite build` copies
  it into `dist/data`.
- French reference dictionary only (`dictionary-fr.ts`), `<html lang="fr">`.
- Theme with `@adrienlcp/theme-preference` (pre-paint script via its Vite
  plugin). Visual direction in `apps/web/DESIGN.md`.
- Shell: header (Députés, Scrutins, Groupes, theme switch on a desk), footer
  citing Assemblée nationale + Licence Ouverte with the last update date, skip
  link, `<Main>`, not-found page, error screen, dataset failure state.
- Pages: home, `/deputes`, `/groupes`, `/methode`, plus steps 05 and 06.
- Checked in a browser at 375/390 and 1280, light and dark, on real data.
