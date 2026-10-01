# 07 — Find my deputy

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
