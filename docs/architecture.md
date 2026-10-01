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
| Cloudflare Pages | unlimited requests and bandwidth; 500 deploys/month; **20,000 files per deploy; 25 MiB per file** | one deploy per night with new data, plus one per push to `main` |
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

## Indexing by search engines

People search for their deputy's name, and a plain SPA is poorly indexed. After
`vite build`, a server build of the same route tree (`src/entry-server.tsx`)
renders each indexed page into its own HTML document (`apps/web/scripts/prerender.ts`),
which the browser hydrates in place:

- **Prerendered:** the home, list and method pages, every deputy page, and the
  solemn votes and motions of censure — about 750 documents, beside the
  datasets, under `MAX_PUBLISHED_FILES` (`packages/protocol/src/deploy-budget.ts`),
  which the build checks against its whole output.
- **Client-rendered:** the ordinary scrutins (8,000+, mostly amendments). Pages
  has no top-level `404.html`, so it answers their paths with `index.html`, the
  prerendered home page; an inline guard empties a document written for
  another path before the first paint, and the app renders the right page.
- **Data at build time:** the prerender installs a `fetch` that answers
  `/data/*` from `.data/`, so the pages are written by the same loaders and
  dataset reader as in the browser, from the files the deployment publishes.
  No router state is inlined: the browser reads the same datasets, then
  hydrates. A deputy page holds the first page of votes only; the rest is
  added from the dataset on request.
- **Head:** each document carries its title, description, canonical URL and
  share tags (`presentation/head/`); the origin is `SITE_ORIGIN`. The home
  page has no canonical link, since its document also answers client-rendered
  paths. `sitemap.xml` lists every prerendered URL.
