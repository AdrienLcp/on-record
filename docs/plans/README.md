# Build plan — index

**Reading a step.** This table is enough to choose; then open only the file of
the step taken. A delivered step keeps its line here (with the date) and loses
its file.

| # | Step | In one line | State |
|---|---|---|---|
| 01 | [Bootstrap](01-bootstrap.md) | Workspace, tooling and CI from toolkit templates, nothing product yet | to do |
| 02 | [Ingest Assembly votes](02-ingest-assembly-votes.md) | Zips → normalised, chunked datasets defined in protocol | to do |
| 03 | [Nightly pipeline and deploy](03-nightly-pipeline.md) | Cron in Actions, skip when unchanged, deploy to Cloudflare Pages | to do |
| 04 | [Web shell](04-web-shell.md) | Router, French dictionary, theme, layout, dataset loading | to do |
| 05 | [Deputy page](05-deputy-page.md) | One person's votes, group history, participation in context | to do |
| 06 | [Scrutin page](06-scrutin-page.md) | What was voted, the result, how each group and deputy voted | to do |
| 07 | [Find my deputy](07-find-my-deputy.md) | Commune or address → constituency → deputy | done 2026-10-01 |
| 08 | [Indexing and launch](08-indexing-and-launch.md) | Prerendered pages, sitemap, sources page, public repo | done 2026-10-01 (repo still private) |

Later, not planned in detail: amendments, Senate votes, HATVP declarations,
2027 programmes (see `docs/product.md`, "Sources, in order of arrival").
