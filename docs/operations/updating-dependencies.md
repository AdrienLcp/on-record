# Updating the dependencies

Brings every dependency of every workspace package, pnpm itself and Biome's
configuration to their latest.

Prerequisites: on `main`, everything committed; Node 26 (`node --version`).

```powershell
pnpm deps:upgrade
```

It runs `corepack use pnpm@latest`, `pnpm -r up -L` (every dependency of the
root, `apps/*` and `packages/*` to its latest, majors included) and
`biome migrate --write`. `pnpm-workspace.yaml` holds back any release younger
than a day, except the `@adrienlcp/*` packages.

Then:

1. Read `git diff -- '**/package.json'`: for each version whose first number
   changed (or second, under 1.0), read the package's release notes for
   breaking changes. `zod`, `fast-xml-parser` and `csv-parse` shape the
   ingest: a major there can change what a dataset holds.
2. Check everything:

   ```powershell
   pnpm validate
   ```

   Expected: lint, spelling, the scripts' typecheck, build and tests all pass.
   With `.data/` present, `pnpm build` prerenders too; then
   `pnpm lighthouse` runs the gate the deploy applies.
3. Commit, then `pnpm ship` ([deploying.md](deploying.md)).

The CI actions (the `uses:` lines of `.github/workflows/ci.yml` and
`.github/workflows/refresh.yml`, the `actionlint` image) and the `wrangler@4`
of the _Deploy_ step are not touched by this command: bump them by hand when a
new major ships.

## Common errors

| Symptom                                     | Fix                                                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ERR_PNPM_PEER_DEP_ISSUES` or peer warnings | A package has not caught up with a new major of its peer. Hold the peer one major back in `package.json` (`"name": "^<previous major>"`), `pnpm install`, and retry later. |
| Biome errors after the upgrade              | Run `pnpm lint` (it fixes what it can), then read what remains: a new rule, or a renamed option `biome migrate` could not move.                                            |
| `pnpm lighthouse` cannot launch Chromium    | Playwright moved to a new browser build: `pnpm --filter @on-record/web exec playwright install chromium`.                                                                  |
| TypeScript errors in code nobody touched    | A dependency's types changed: read its release notes; fix the call sites.                                                                                                  |
| `corepack` refuses to download pnpm         | `corepack enable` (as administrator once), or update Node.                                                                                                                 |
| Something breaks and there is no time       | `git checkout -- '**/package.json' pnpm-lock.yaml`, then `pnpm install`: back to the previous versions.                                                                    |
