# Hosting

| Piece       | Provider                              | Identifier (`scripts/operations/hosting.ts`)                      |
| ----------- | ------------------------------------- | ----------------------------------------------------------------- |
| The site    | Cloudflare Pages, account `431a5290…` | project `on-record`, host `on-record-203.pages.dev`               |
| Its address | Cloudflare DNS, zone `adrienlcp.com`  | proxied `CNAME on-record.adrienlcp.com → on-record-203.pages.dev` |

The site is static files: no Worker, no Pages Functions, no server.
`apps/web/public/_headers` keeps the `pages.dev` hosts out of search engines.
Pages caps a deployment at 20,000 files and 25 MiB a file;
`packages/protocol/src/deploy-budget.ts` keeps the build under 15,000 files
([`docs/architecture.md`](../architecture.md)).

The CI secrets that let GitHub deploy to Cloudflare are covered in
[secrets.md](secrets.md).

## Create or recreate it — `pnpm hosting:create`

Creates whichever piece is missing and leaves the others alone: run it after
deleting the project by mistake, or just to check. It never deletes or changes
an existing piece. The project it creates is a direct-upload one, which the
_Deploy_ step of `.github/workflows/refresh.yml` fills.

Prerequisite: the Bitwarden entry `Cloudflare Pages token`
([secrets.md](secrets.md)).

```powershell
pnpm hosting:create
```

Expected, when everything exists:

```text
hosting:create: Pages project on-record exists
hosting:create: on-record.adrienlcp.com is attached to the Pages project
hosting:create: DNS on-record.adrienlcp.com → on-record-203.pages.dev exists
hosting:create: done: …
```

Each missing piece prints `created` or `attached` instead.

After recreating the Pages project:

1. Cloudflare gives it a `pages.dev` host with a new suffix
   (`on-record-<suffix>.pages.dev`); the script points the DNS at it. Replace
   `on-record-203` with that host in `apps/web/public/_headers`, so the
   `pages.dev` copy stays out of search engines, and in the table above.
2. `pnpm secrets:sync` if the GitHub secrets are new or were lost too.
3. Deploy: `gh workflow run refresh.yml -R AdrienLcp/on-record`
   ([deploying.md](deploying.md)). The custom domain answers once its
   certificate is issued, a few minutes after attaching.

## Deploy by hand

The last resort, when CI cannot deploy: from a clean clone of `main` only (it
ships whatever the folder holds). The prerender needs the datasets, so
`.data/` must be there: copy it from the main checkout, or run `pnpm ingest`
(it downloads the open data, several hundred MB). Unlock first
([secrets.md](secrets.md), _Unlocking_), then in that terminal:

```powershell
pnpm install --frozen-lockfile; pnpm ingest; pnpm build
```

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "431a529079f2d76802b95056e39950f0"; $env:CLOUDFLARE_API_TOKEN = bw get password "Cloudflare Pages token"; pnpm dlx wrangler@4 pages deploy apps/web/dist --project-name on-record --branch main
```

Close the terminal afterwards: it holds the token. This skips the Lighthouse
gate CI applies: `pnpm lighthouse` runs it locally after the build (once per
machine first: `pnpm --filter @on-record/web exec playwright install chromium`).

## Common errors

| Message                                                                               | Fix                                                                                                                                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A `Bitwarden …` message                                                               | See [secrets.md](secrets.md).                                                                                                                                      |
| `… answered 403` with `Authentication error` (code `10000`)                           | The Cloudflare token lacks a permission listed in [secrets.md](secrets.md), or expired: renew it.                                                                  |
| `… answered 409` on the Pages project                                                 | The name `on-record` is taken by a project of another kind (a Worker): rename it in `hosting.ts` and in the _Deploy_ step of `.github/workflows/refresh.yml`.      |
| `DNS on-record.adrienlcp.com points to …, not …`                                      | A record exists with another target: in the dashboard, _adrienlcp.com → DNS → Records_, edit it to the `pages.dev` host printed.                                   |
| The site answers `522` or a certificate error                                         | The certificate is not issued yet: wait ten minutes. Still failing: dashboard → _Workers & Pages → on-record → Custom domains_, and follow what it reports.        |
| `… over the budget of 15000 per deployment` (prerender), or `too_many_files` (ingest) | The output crossed the 15,000-file budget kept under the Pages cap: see `packages/protocol/src/deploy-budget.ts` and [`docs/architecture.md`](../architecture.md). |
