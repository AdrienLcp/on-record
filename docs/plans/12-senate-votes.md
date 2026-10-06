# 12 — Senate votes

The same record as for deputies, for senators: what each one voted, what each
Senate scrutin decided, how each group voted. Raw facts on the source (tables,
codes, traps) go to `docs/data-sources.md`, "Senate", as they are confirmed.

## Scope

- Scrutins since the session opened on 2023-10-02 (the 2023 renewal): before
  it, ballots do not cover every senator. ≈ 900 scrutins.
- Senators: everyone who held a seat since that date, the 2026 newcomers
  included (shown with no vote yet).
- Not in this step: Senate group pages, find my senator, amendments tabled in
  the Senate.

## Source

- `https://data.senat.fr/data/dosleg/dosleg.zip` — PostgreSQL dump: `scr`,
  `votsen`, `corscr`, and `date_seance` → `lecass` → `lecture` → `loi` for the
  text a scrutin belongs to.
- `https://data.senat.fr/data/senateurs/export_sens.zip` — same format: `sen`,
  `elusen`, `memgrppol`, `grppol`, `dpt`.
- Licence Ouverte v2.0, producer named « Sénat — data.senat.fr ».
- Both dumps are read as text, `COPY … FROM stdin` blocks streamed line by
  line; no PostgreSQL. Windows-1252 bytes stored as C1 controls are mapped back
  (’ – œ … € “ ” •).

## Protocol

- Chamber-neutral pieces leave `assembly/` for `votes/`: ballot position, vote
  totals, scrutin kind, scrutin outcome. Both chambers import them.
- `senate/`: senator id (matricule, `\d{5}[A-Z]`), group id (`grppolcod`),
  senator, group, scrutin summary and detail with a string id
  `"<session>-<number>"` (`2025-340`), senator record. Same field names as the
  Assemblée where the meaning is the same, so web components take either.
- Dataset paths under `senate/`: `senators.json`, `groups.json`,
  `scrutins.json`, `scrutins/<session>-<block>.json` (blocks of 100 within a
  session), `senators/<senatorId>.json`.

## Ingest

- New domain folder `apps/ingest/src/domain/senate-votes/`; two sources in
  `ingestSources`, refreshed on ETag like the others.
- Outcome: adopted when for > against (the dump has no outcome column).
- Kind: `solemn` when at least one ballot was cast by delegation, else
  `ordinary`. No censure in the Senate.
- Group at the vote date from `memgrppol`; majority position computed as for
  the Assemblée. Official totals from `scr`, not recounted.
- Corrections: ballots flagged `*` in `votsen`, intended position read from the
  `corscr` sentence naming the senator; an unmatched one is counted in the
  report, never guessed.
- Scrutins missing from the dump (gaps in the numbering of a session) are
  listed in the index as missing, with the official page link.

## Web

- Routes: `/senateurs`, `/senateurs/:senatorId`, `/senat/scrutins`,
  `/senat/scrutins/:scrutinId`. Load `impeccable` before the pages.
- Senator page: identity, group history, votes with the group's position and
  corrections, official page and HATVP links.
- Senate scrutin page: what was voted (principle 3), result, groups, nominal
  list, corrections, link to the official scrutin and to the text's dossier.
- Principle 2, Senate wording: a group may vote for all its members, so a
  recorded ballot proves no presence and there is no participation figure.
- Sources: footer and sources page name the Senate; prerender every senator
  and every solemn Senate scrutin; sitemap follows.

## Done when

- `pnpm validate` green; ingest run on the real dumps, sizes logged, file
  budget checked.
- Pages checked in the browser (desktop and 375 px): a senator with
  corrections, a 2026 newcomer, a solemn and an amendment scrutin, a missing
  one.
- `docs/data-sources.md`, `docs/product.md`, this file removed, index line
  dated.
