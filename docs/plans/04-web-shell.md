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
