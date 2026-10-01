# 07 — Find my deputy

## Done (2026-10-01)

- Ingest (`apps/ingest/src/domain/constituencies/`) builds
  `assembly/communes.json` (34,963 current communes, 134 split) and
  `assembly/constituency-contours/<department>.json` (66 departments) from
  the Ministry's 2017 table, INSEE's COG 2026, La Poste's postcodes and the
  data.gouv.fr contours — sources, traps and sizes in
  `docs/data-sources.md` § Find my deputy. 0 current commune unplaced; the run
  fails if one ever is.
- Web: `/mon-depute?commune=<INSEE>` and a card on the home page. Commune
  autocomplete by name or postcode (accent-insensitive, every commune of a
  full postcode offered), the index downloaded on first focus. One
  constituency → the deputy; several → the address, geocoded by the Base
  Adresse Nationale (`data.geopf.fr/geocodage`, superseded requests
  aborted), tested against the contours in the browser
  (`constituency-at-point.ts`). A vacant seat says so, with its last holder.
- Checked in a browser at 390 and 1280 px, light and dark: Vonnas (Ain 4th,
  Jérôme Buisson), postcode 01340 → Attignat (Ain 1st, Xavier Breton),
  10 rue de Vaugirard, Paris (2nd, Michel Barnier), 2 rue de la République,
  Marseille (Bouches-du-Rhône 4th, Manuel Bompard), 1 place Bellecour, Lyon
  (Rhône 2nd, Boris Tavernier); the three deputies cross-checked on
  assemblee-nationale.fr.
- Not done: delegated communes (old village names merged into a commune
  nouvelle) are not searchable by their former name; the vacancy screen was
  verified by test only, no seat being vacant today.


Goal: from the home page, a citizen types where they live and lands on their
deputy.

## Read first

`docs/data-sources.md` § Find my deputy.

## Approach

1. Ingest builds `communes.json`: commune (name, INSEE code, postcodes) →
   constituencies. Most communes map to one constituency: answer directly.
2. For communes split across constituencies (large cities), ask for the
   address, geocode it with the Base Adresse Nationale public API from the
   browser, and test the point against the constituency contours
   (simplified GeoJSON of that commune's constituencies only, shipped as a
   dataset).
3. Search box with commune autocomplete, client-side.

## Verify before building

- Current BAN API URL, terms and rate limits.
- That the 2017 commune table still matches current communes (mergers since
  2017 create new INSEE codes): measure how many communes are unmatched.

## Done when

- A small commune, a postcode shared by several communes, and an address in a
  split city (Paris, Lyon or Marseille) each land on the right deputy, checked
  in a browser.
