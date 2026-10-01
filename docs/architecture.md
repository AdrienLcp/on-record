# Architecture

## The constraint: zero running cost

The data changes once a night and every visitor reads the same thing. So all
the work happens once, at build time, and the site is static files:

```
GitHub Actions (nightly cron)
  └─ apps/ingest: conditional GET of the open-data zips
       └─ normalise → compact JSON datasets (shape defined in packages/protocol)
            └─ apps/web build (Vite) + datasets
                 └─ deploy to Cloudflare Pages
```

No server, no database at runtime. The browser fetches static JSON files.

## What is free, and its limits

| Piece | Free allowance | This project's use |
|---|---|---|
| GitHub Actions | unlimited on a public repo; 2,000 min/month on a private one | one nightly job of a few minutes, skipped when no source changed |
| Cloudflare Pages | unlimited requests and bandwidth; 500 deploys/month; **20,000 files per deploy; 25 MiB per file** | one deploy per night at most |
| Open-data sources | free, no key, no rate limit seen | one conditional GET per file per night |
| Domain name | `*.pages.dev` is free | a custom domain is the only optional cost (~10 €/year) |

Verify the Cloudflare figures when setting up the deploy (step 03): they are
the ones the design leans on.

**The file-count limit drives the dataset shape.** One file per scrutin would
be 8,400 files today and past 20,000 within a few years, before any second
source. Datasets are therefore chunked: scrutins by blocks of numbers, one file
per deputy, small index files for lists and search.

## When a server would be needed

Free-text search across everything, user accounts, or alerts by email. None is
in the plan. If one becomes necessary, the first option is a Cloudflare Worker
(free tier: 100,000 requests/day) reading the same datasets, before any
always-on server. A free Render service sleeps after inactivity, so a cold
visit waits ~50 s: unfit for a public site.

## Repository layout

Toolkit's multi-app shape (`toolkit/conventions/monorepo.md`):

```
apps/ingest/          → Node script: download, normalise, write datasets
apps/web/             → Vite + React site
packages/protocol/    → Zod schemas of the published datasets: the contract
                        between ingest (writes) and web (reads)
e2e/                  → Playwright, against the built site with fixture data
```

`apps/ingest` follows the server layout of `toolkit/conventions/backend.md`
without the HTTP part: `domain/<source>/` per data source
(`assembly-votes`, later `senate-votes`, `hatvp`…), `infrastructure/` for the
download client and the file writer. Adding a source is adding a domain
folder and its datasets — nothing else moves.

`packages/core` appears only when web and ingest share a rule (toolkit: a
shared package needs a second consumer).

## Open decision: indexing by search engines

A plain Vite SPA is poorly indexed, and people will search for their deputy's
name. Prerendering the deputy and scrutin pages at build time is the likely
answer; the mechanism is chosen in step 08, not before.
