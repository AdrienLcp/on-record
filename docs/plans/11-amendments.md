# 11 — Amendments tabled

What each deputy proposed to change in the texts, and what became of it.
Often more telling than votes: most of a deputy's legislative work is there.

Raw facts on the source (paths, outcome codes, sizes, link to scrutins) are in
`docs/data-sources.md`, "Amendments".

## Ingest

- New source `assembly-amendments`: `loi/amendements_div_legis/Amendements.json.zip`
  (≈310 MB zipped, 868 MB of JSON). Never unzipped at once: entries are
  inflated and parsed one at a time, and only the compact record is kept.
- One record per amendment authored by a deputy (`Député` or `Rapporteur`);
  government amendments are left out. An author missing from `deputies.json`
  is counted in the run report, not a failure.
- Outcome from `cycleDeVie.sort` when set, else from the processing state:
  `adopted`, `rejected`, `fell`, `notMoved`, `withdrawn`, `inadmissible`,
  `pending`.
- Legislative file from the zip path (`json/<DLR>/<text>/<uid>.json`);
  `incorrect_data` → none.
- Official page path built from the uid: `<text digits><PLF part>/<organ>/<number>`.
- Summary: the author's `exposeSommaire`, HTML stripped, cut at 200 characters
  on a word boundary. The full text stays on the official page.
- Link to a scrutin: scrutin title parsed for the amendment number, matched on
  the sitting (`seanceRef` ↔ `seanceDiscussionRef`); kept only when unique and
  when both outcomes agree; spread to identical amendments of the same sitting.
- Co-signatures: a count per deputy, never a list (group-wide co-signing makes
  them meaningless one by one).

## Datasets

- `assembly/amendments/<deputyId>.json` — `{ deputyId, cosignedCount, amendments[] }`,
  newest first. One per deputy, even with no amendment.
- `assembly/legislative-files.json` — `[{ id, title }]` for the files the
  amendments cite.

## Deputy page

A "Amendements déposés" card under the votes, loaded beside them:

- Total, then one filter per outcome with its count (principle 6: each count
  shows the amendments it counts). "Cosignés : N" stated apart.
- Each line: number, article, text title, stage (committee or sitting), date,
  outcome, summary, "Lire l'amendement" (official page), "Voté au scrutin n° X"
  when linked. Rapporteur amendments flagged as tabled on behalf of a committee.
- Plain-language notes: what inadmissible, fell and not moved mean; the same
  amendment may be tabled in committee then again in the sitting; no success
  rate, no comparison, no ranking.

## Done when

- `pnpm validate` green; ingest run on the real zip, sizes logged.
- Deputy page checked in the browser (desktop and 375 px), filters and official
  links working; official URL pattern checked on a committee, a sitting, a
  budget (PLF part) and a rectified amendment.
- `docs/data-sources.md` and `docs/product.md` updated, this file removed.
