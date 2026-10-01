# 02 — Ingest Assembly votes

## Measured (2026-10-01, full run on the real dumps)

| Dataset | Files | Raw | Largest file | gzip |
|---|---|---|---|---|
| `assembly/deputies.json` | 1 | 299 KB | — | 36 KB |
| `assembly/groups.json` | 1 | 2 KB | — | — |
| `assembly/scrutins.json` (index) | 1 | 2.9 MB | — | 190 KB |
| `assembly/scrutins/<block>.json` | 85 | 116 MB | 2.5 MB | 50 KB for block 50 |
| `assembly/deputies/<id>.json` | 649 | 126 MB | 873 KB | 28 KB |
| `meta.json` | 1 | 1 KB | — | — |

- **738 files**, 246 MB raw; the run fails above `MAX_PUBLISHED_FILES`
  (15,000).
- 8,434 scrutins, 649 deputies (577 sitting, 72 who left), 14 groups.
- Run time: ~20 s with downloads (40 MB of zips), ~8 s rebuilding from the
  cache (`--force`), under 1 s when nothing changed.
- 371 ballots are listed under another group than the deputy's mandates give
  for that day, all on the first days after a deputy arrives or returns from
  the government: `groupPosition` follows the group the ballot is listed under.

### Skip mechanism

Each zip is fetched with `If-None-Match` / `If-Modified-Since` against
`.cache/assembly/<zip>.validators.json`. When no source changed and
`.data/meta.json` exists, the run logs `{"event":"sources_unchanged"}`, writes
nothing and exits 0. Under GitHub Actions it also appends `changed=true|false`
to `$GITHUB_OUTPUT`, so later steps use
`if: steps.<ingest step id>.outputs.changed == 'true'`. `pnpm ingest --force`
or `INGEST_FORCE=true` rebuilds anyway. A failure exits 1 with
`{"event":"ingest_failed", "code": …}` on stderr.

### Traps found in the data (beyond `data-sources.md`)

- **AMO10 keeps only running mandates**: a sitting deputy's past groups are in
  AMO30 alone, so AMO30 wins for an actor in both (AMO30 holds all 649).
- **`PO0` placeholder group** in 14 scrutins (all groups of scrutins 489–501,
  RN alone in 1302 and 6256): resolved to the group every listed voter belonged
  to that day; a `PO0` group with no voter and no vote is left out.
- **A stale replica** sometimes answers with the previous night's zip under
  another ETag: a download whose `Last-Modified` is not later than the cached
  one is ignored.
- `positionMajoritaire` is `pour` for a group none of whose members voted
  (~9,000 times): published as `null`.
- GP mandates repeat per role and split at renewals: same-group mandates that
  overlap or follow each other the next day are folded into one spell.
- A minister back in the chamber gets a second seat mandate whose `dateDebut`
  is election day: the seat starts at `mandature.datePriseFonction`.
- "Mises au point" buckets come padded in arrays (`[null, { votant }]`), and
  `miseAuPoint.dysfonctionnement` (votes the system failed to record, 145
  scrutins) is published as corrections too. 932 corrections come from
  deputies with no recorded ballot: they appear in the scrutin's corrections
  but not in the deputy's record.

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
