# 03 — Nightly pipeline and deploy

Goal: every night, fresh data is online, with no machine of Adrien's involved
and no cost.

## State (2026-10-01)

- Cloudflare Pages project `on-record` (direct upload, account of
  adrienlcp@gmail.com), live at <https://on-record-203.pages.dev>. First
  deploys made by hand: `pnpm ingest && pnpm build`, then
  `npx wrangler pages deploy apps/web/dist --project-name on-record --branch main`.
- `.github/workflows/refresh.yml`: cron 07:00 UTC, on push to `main`, and
  manual (with a `force` input). Restores `.cache` + `.data` from the Actions
  cache, runs ingest (its `changed` output skips the rest on a night with no new
  source), builds, deploys with wrangler.
- `ci.yml` builds without datasets (no prerender); the refresh workflow runs
  the full build.

## Left to do — needs Adrien once

The deploy step is skipped until both repository secrets exist:

1. Cloudflare dashboard → My Profile → API Tokens → Create Token → Custom:
   permission **Account · Cloudflare Pages · Edit**, on his account only.
2. `gh secret set CLOUDFLARE_API_TOKEN -R AdrienLcp/on-record` (paste the
   token when prompted), then
   `gh secret set CLOUDFLARE_ACCOUNT_ID -R AdrienLcp/on-record -b 431a529079f2d76802b95056e39950f0`.
3. Actions → "Refresh and deploy" → Run workflow, and check it deploys.

## Done when

- A manual run deploys; a second run the same night skips the build.
- Run time × 30 stays far under 2,000 Actions minutes a month (private repo).
