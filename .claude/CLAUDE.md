# on-record

A public, free-to-run site showing what French elected officials do on the
record: votes first, other sources later. Audience: citizens with no
parliamentary knowledge. Personal project (`github.com/AdrienLcp/on-record`).

## Conventions

This repo has no `.claude/rules/`: the conventions are `C:/git/toolkit`
(load the `adrien-stack` skill before writing code). English in everything
committed; the UI dictionary is French.

## Where things are

- `docs/plans/README.md` — the build plan index. Read it first, then open only
  the step being worked on.
- `docs/data-sources.md` — URLs, formats and traps of every dataset. Read the
  section of the source being touched before writing ingestion code.
- `docs/product.md` — editorial principles. Any screen that ranks, scores or
  summarises a person must respect them.
- `docs/architecture.md` — why there is no server, and the free-tier limits
  the design must stay under.

## Rules that matter most

1. **Zero running cost.** No always-on server, no paid database. A change that
   needs one is a decision for Adrien, not an implementation detail.
2. **Neutral by construction.** Every number shown links to the votes it comes
   from; no ranking of "lazy" or "bad" deputies; absence is never shown as a
   moral judgement.
3. **The source is cited** on every page (Licence Ouverte requirement).
