# When a step breaks

Find the step, read its log, apply the fix. The pages of each action carry
their own table of errors; this one covers what lies between them.

## Read the failure

A failed run, of either workflow (`CI` or `Refresh and deploy`):

```powershell
gh run list -R AdrienLcp/on-record --limit 5
```

```powershell
gh run view <id> -R AdrienLcp/on-record --log-failed
```

Expected: the log of the failing step only. Re-run it once the cause is fixed
— or straight away for a network hiccup:

```powershell
gh run rerun <id> -R AdrienLcp/on-record --failed
```

A failed scheduled refresh changes nothing on the site: it keeps the last
deployment until a refresh passes.

## By step

| Workflow, step       | Symptom                                           | Fix                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Both, `pnpm install` | `ERR_PNPM_OUTDATED_LOCKFILE`                      | `pnpm install` here, commit `pnpm-lock.yaml`, ship.                                                                                                                                                  |
| CI, Lint             | `biome ci` errors                                 | `pnpm lint` here, commit, ship.                                                                                                                                                                      |
| CI, Spell            | `Unknown word`                                    | Fix the typo, or add a real word to `cspell.json` → `words` (French source fields go in the `overrides` for their files).                                                                            |
| CI, Build or tests   | A failing test or type error                      | Reproduce with `pnpm validate` here; fix; ship.                                                                                                                                                      |
| CI, actionlint       | An error in a workflow file                       | Fix the expression it names in `.github/workflows/`; ship.                                                                                                                                           |
| Refresh, Ingest      | A source fails its schema or cannot be downloaded | An open-data source changed its format or moved. Read its section in [`docs/data-sources.md`](../data-sources.md), reproduce with `pnpm ingest` here, fix `apps/ingest`, ship.                       |
| Refresh, Build       | The prerender fails                               | Reproduce with `pnpm ingest` then `pnpm build` here (CI's own build stops before the prerender, so only this run meets it); fix; ship.                                                               |
| Refresh, Lighthouse  | A page scores under 100                           | Download the run's `lighthouse-reports` artifact (`gh run download <id> -R AdrienLcp/on-record -n lighthouse-reports`), read the failing audit, reproduce with `pnpm build` then `pnpm lighthouse`.  |
| Refresh, Deploy      | Step _skipped_                                    | Either a newer commit reached `main` (its run deploys), or the repository lacks `CLOUDFLARE_API_TOKEN`: `pnpm secrets:sync` ([secrets.md](secrets.md)), then `gh workflow run refresh.yml`.          |
| Refresh, Deploy      | `Authentication error [code: 10000]`              | The Cloudflare token expired or lost a permission: renew it ([secrets.md](secrets.md)).                                                                                                              |
| Refresh, Deploy      | The project is not found                          | The hosting is gone: recreate it ([hosting.md](hosting.md)).                                                                                                                                         |
| Site                 | Data from yesterday or older                      | Check the last scheduled `Refresh and deploy` run: green with _Build_ skipped means no source changed; red means read its log. Force a rebuild: [deploying.md](deploying.md), _The nightly refresh_. |
| Site                 | Old version still showing                         | Hard-reload. Check the refresh run deployed the commit you expect.                                                                                                                                   |
| Site                 | Blank page, console errors                        | Undo the deploy ([deploying.md](deploying.md)), then reproduce locally.                                                                                                                              |
| Any script           | A `Bitwarden …` message                           | [secrets.md](secrets.md), _Common errors_.                                                                                                                                                           |
| Any script           | `pnpm: command not found` or a wrong pnpm version | `corepack enable`, open a new terminal.                                                                                                                                                              |

## Still stuck

- Cloudflare status: https://www.cloudflarestatus.com — GitHub:
  https://www.githubstatus.com
- Deploy by hand, from a clean clone of `main`, with the token read from
  Bitwarden: [hosting.md](hosting.md), _Deploy by hand_.
