# 08 — Indexing and launch

Goal: people searching a deputy's name find the page; the project is ready to
be shown.

## Do

1. Choose the prerendering mechanism (the open decision in
   `docs/architecture.md`): every deputy and scrutin page rendered to HTML at
   build, hydrated in the browser. Count the generated files against the
   20,000 limit — scrutin pages may have to stay client-rendered while deputy
   pages are prerendered.
2. Per-page title, description and social preview image.
3. `sitemap.xml`, `robots.txt`.
4. "Sources and method" page: every dataset, its licence, its refresh date
   (shown from the data), and the editorial principles.
5. Lighthouse pass (accessibility first).
6. Repo goes public when Adrien decides; README with screenshots for the
   portfolio.

## Done when

- A deputy page's HTML, fetched without JavaScript, contains the name and the
  votes summary.
- Lighthouse accessibility score checked on deputy, scrutin and home pages.

## Done (2026-10-01)

- Prerender: `pnpm build` in `apps/web` is `build:client` → `build:ssr`
  (`src/entry-server.tsx`) → `prerender` (`scripts/prerender.ts`). 749
  documents: the five fixed pages, 649 deputies, 95 solemn votes and motions
  of censure. Ordinary scrutins stay on the SPA fallback; the decision and the
  mechanism are in `docs/architecture.md`, "Indexing by search engines".
- Hydration: `main.tsx` waits for the router and the loaders' data, then
  `hydrateRoot`s in place with no mismatch (checked in Chromium on the
  Wrangler Pages server, both themes). A URL with a filter in its query
  renders afresh instead, since the document was written unfiltered.
- File budget: `MAX_PUBLISHED_FILES` moved to `packages/protocol`; ingest
  checks its datasets against it, the prerender its whole `dist` (1,548 files,
  295 MiB, 237 MiB of which are datasets).
- Head: title, description, canonical, Open Graph and Twitter card per page
  (`presentation/head/`), one share card `public/og.png`; `sitemap.xml` and
  `robots.txt` written by the prerender.
- `/methode` names each source file, its date and its licence.
- Checks: axe-core (WCAG 2.1 AA + best practices) finds nothing on eight
  pages in both themes; Lighthouse on home, a deputy and a solemn vote:
  accessibility, best practices and SEO 100, performance 79–89 (local server).
- README with screenshots in `docs/screenshots/`.
- CI builds up to the server bundle without datasets; the nightly refresh
  runs the whole build, prerender included.
