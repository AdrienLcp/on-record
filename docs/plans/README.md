# Build plan — index

**Reading a step.** This table is enough to choose; then open only the file of
the step taken. A delivered step keeps its line here (with the date) and loses
its file; what it taught lives in `docs/data-sources.md` and
`docs/architecture.md`.

| # | Step | In one line | State |
|---|---|---|---|
| 01 | Bootstrap | Workspace, tooling and CI from toolkit templates | delivered, 01/10/2026 |
| 02 | Ingest Assembly votes | Zips → normalised, chunked datasets defined in protocol | delivered, 01/10/2026 |
| 03 | Nightly pipeline and deploy | Nightly refresh + deploy on push to main, from GitHub Actions | delivered, 01/10/2026 |
| 04 | Web shell | Router, French dictionary, theme, layout, dataset loading | delivered, 01/10/2026 |
| 05 | Deputy page | One person's votes, group history, participation in context | delivered, 01/10/2026 |
| 06 | Scrutin page | What was voted, the result, how each group and deputy voted | delivered, 01/10/2026 |
| 07 | Find my deputy | Commune or address → constituency → deputy | delivered, 01/10/2026 |
| 08 | Indexing and launch | Prerendered pages, sitemap, share card, README | delivered, 01/10/2026 |
| 09 | Group pages | One page per group: published position on every scrutin, solemn votes and censure first | delivered, 01/10/2026 |
| 10 | Guided path home | Twelve texts, one at a time, then the race parties' votes beside the visitor's answers | delivered, 02/10/2026 |
| 11 | Amendments | What each deputy tabled and what became of it, on the deputy page | delivered, 06/10/2026 |

Later, not planned in detail: Senate votes, HATVP declarations
(see `docs/product.md`, "Sources, in order of arrival").
