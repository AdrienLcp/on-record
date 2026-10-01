# 03 — Nightly pipeline and deploy

Goal: every night, fresh data is online, with no machine of Adrien's involved
and no cost.

## Do

1. Workflow `.github/workflows/refresh.yml`, cron at 07:00 UTC (sources are
   refreshed between 22:00 and 06:00 UTC), plus `workflow_dispatch`.
2. Cache the source ETags between runs (`actions/cache`); if no source
   changed, stop before building.
3. Run ingest, build web with the datasets copied into its output, deploy with
   `wrangler pages deploy` to a Cloudflare Pages project `on-record`.
4. Pushes to `main` also deploy (code changes), reusing the last datasets —
   cached, or re-ingested if the cache is cold.
5. On failure, the previous deploy stays online; GitHub's failure email is the
   alert. No custom alerting.

## Needs Adrien (one-time)

- A Cloudflare account (free), a Pages project, an API token restricted to
  Pages, stored as GitHub secrets `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`.

## Verify

- Re-check Cloudflare Pages free limits (files per deploy, file size, deploys
  per month) and GitHub Actions minutes for a private repo; update the table
  in `docs/architecture.md` if they moved.

## Done when

- A manual run deploys; the `*.pages.dev` URL serves the datasets.
- A second run the same day skips the build.
- Monthly Actions minutes, estimated from the run time, fit in the free
  allowance with a large margin.
