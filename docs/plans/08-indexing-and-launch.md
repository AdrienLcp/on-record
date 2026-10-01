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
