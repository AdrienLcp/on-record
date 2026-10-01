# 02 — Ingest Assembly votes

Goal: `pnpm --filter ingest start` turns the official zips into the datasets
the site reads, written to `.data/` (git-ignored).

## Read first

`docs/data-sources.md` § Assemblée nationale (all of it, traps included);
`toolkit/conventions/backend.md`, `errors.md`, `testing.md`.

## Inputs

Scrutins, AMO10 and AMO30 zips (see data-sources for URLs).

## Shape

```
apps/ingest/src/
  domain/assembly-votes/
    assembly-votes.ts          → domain types (Deputy, Group, Scrutin, Vote)
    raw-scrutin.ts             → Zod schema of the official JSON, normalising
                                 strings, nulls and one-item objects to arrays
    raw-actor.ts, raw-organ.ts → same for actors and organs
    group-at-date.ts           → a deputy's group on a given day
    assembly-votes-service.ts  → raw files → datasets, returns a Result
    assembly-votes-errors.ts
  infrastructure/
    open-data-client.ts        → conditional GET (ETag), unzip; the only fetch
    dataset-writer.ts          → writes datasets; the only fs writer
packages/protocol/src/
  assembly-votes/              → Zod schemas of the published datasets
```

## Datasets (first draft — fix in protocol, then build to it)

- `deputies.json` — every deputy of the legislature: id, name, constituency,
  current group, dated group history, HATVP link.
- `groups.json` — id, name, short name, official colour, dates.
- `scrutins/index.json` — every scrutin, summary only: number, date, title,
  type, result, totals. Small enough to filter and search in the browser;
  measure it, split by year if it is not.
- `scrutins/<block>.json` — full detail by blocks of 100 numbers: per-group
  majority position and the nominal list, plus corrections (mises au point).
- `deputies/<id>.json` — that deputy's position on every scrutin
  (compact codes, group at the date, correction if any).

Respect the 20,000-files limit (`docs/architecture.md`): count the output
files and fail the run above a threshold well under it.

## Tests (decisions, not plumbing)

- A one-voter bucket and a null bucket both normalise to arrays.
- A deputy who changed group gets the right group on each side of the change.
- A correction is kept beside the recorded vote, not replacing it.
- A delegated vote is flagged.
- Fixtures: a handful of real scrutin and actor files, trimmed, committed under
  the test folder.

## Done when

- A full run on the real dumps produces the datasets; sizes and file count are
  printed and noted at the top of this plan.
- Every published file parses against its protocol schema.
- A second run with unchanged sources downloads nothing.
