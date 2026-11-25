# Deploying

Two workflows run on every push to `main`, side by side:

- `.github/workflows/ci.yml` (_CI_) validates: lint, spelling, the build up to
  the prerender, the tests with coverage, and `actionlint` on the workflows.
  It deploys nothing; the prerender needs the datasets, which it does not
  download.
- `.github/workflows/refresh.yml` (_Refresh and deploy_) deploys: it ingests
  the open data, runs the whole `pnpm build` (prerender included), gates it on
  Lighthouse, then `wrangler pages deploy apps/web/dist` to the Pages project
  `on-record`.

The deploy does not wait for CI: a push that fails CI still deploys if the
refresh passes. Shipping is pushing; nothing is built or deployed from this
machine.

## Ship — `pnpm ship`

Prerequisites: on `main`, everything committed, `origin/main` pulled, and
`pnpm validate` green (CI runs the same checks, but does not hold the deploy
back).

```powershell
pnpm ship
```

Expected: `git push` output, then `ship: pushed; watching the ci.yml run <id>`
and its jobs ticking green, then the same for the `refresh.yml` run, and
`ship: deployed to https://on-record.adrienlcp.com`. Open the site and check
the change.

The refresh run takes several minutes: the ingest restores the cached
downloads and datasets, and rebuilds them when `apps/ingest/src` or
`packages/protocol/src` changed; then Chromium is installed for Lighthouse.

| Error                                         | Fix                                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `only main deploys`                           | `git switch main`, merge or cherry-pick the work there.                                                                     |
| `the working tree has uncommitted changes`    | Commit (or `git stash`) first.                                                                                              |
| `origin/main has commits this checkout lacks` | `git pull --rebase`, then `pnpm validate`, then `pnpm ship`.                                                                |
| `nothing to ship`                             | Every commit is already pushed. To re-deploy the same commit: `gh workflow run refresh.yml` (below).                        |
| `the ci.yml run failed`                       | The refresh run deploys regardless: fix and ship again. See [troubleshooting.md](troubleshooting.md).                       |
| `the refresh.yml run failed`                  | Nothing was deployed; the site keeps the previous version. Open the run link; see [troubleshooting.md](troubleshooting.md). |
| `pushed; follow the … run on …/actions`       | `gh` is missing or logged out; the push is done, watch the page. `gh auth login` fixes it for next time.                    |

A green refresh run can still skip its _Deploy_ step: when a newer commit
reached `main` meanwhile (that commit's own run deploys), or when the
repository lacks `CLOUDFLARE_API_TOKEN` ([secrets.md](secrets.md)). Open the
run to check the step ran.

## The nightly refresh

`refresh.yml` also runs every day at 07:00 UTC, after the sources are rebuilt
(between 22:00 and 06:00 UTC). It downloads only the files whose ETag changed;
when no source changed, it builds and deploys nothing and the run is green.
When one did, it rebuilds the datasets, builds, passes the Lighthouse gate and
deploys, exactly as a push does.

To refresh now, or to re-deploy the head of `main` without a new commit:

```powershell
gh workflow run refresh.yml -R AdrienLcp/on-record
```

To rebuild every dataset even though no source changed (after a fix to a
source's handling the cache key did not catch):

```powershell
gh workflow run refresh.yml -R AdrienLcp/on-record -f force=true
```

Expected: `Created workflow_dispatch event for refresh.yml at main`. Follow it
with `gh run watch -R AdrienLcp/on-record` and pick the run. A run started by
hand always builds and deploys, changed data or not.

## Undo a deploy

The way that leaves the history right: revert the commit and ship.

```powershell
git revert <commit>
```

```powershell
pnpm ship
```

Faster, while the fix is prepared: Cloudflare dashboard → _Workers & Pages →
on-record → Deployments_, a previous deployment → _Rollback_. The next deploy
replaces the rollback — the next morning's refresh included, if a source
changed overnight.
