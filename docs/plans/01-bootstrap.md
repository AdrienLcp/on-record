# 01 — Bootstrap

Goal: a workspace where `pnpm validate` passes on empty apps, with CI green.
No product code.

## Read first

`toolkit/conventions/README.md`, `monorepo.md`, `tooling.md`;
`toolkit/templates/base/` and `toolkit/templates/web-app/`.

## Do

1. Root from `templates/base/`: `package.json` (name `on-record`),
   `pnpm-workspace.yaml` (+ `packages: [apps/*, packages/*]`), `biome.json`,
   `tsconfig.json` including `apps/**` and `packages/**`, `.githooks/`,
   `.github/workflows/ci.yml`. Root scripts fan out with `pnpm -r`, as in
   taverla.
2. `apps/web` from `templates/web-app/`. Dev port **5480** with `strictPort`
   (5173, 5186 and 5373 are taken by other projects).
3. `apps/ingest`: Node package, `dev` = `node --import tsx src/index.ts`,
   `build` = `tsc --noEmit && tsdown`, `src/index.ts` (process entry),
   `src/env.ts` (only reader of `process.env`).
4. `packages/protocol`: source-only package, depends on zod only.
5. One root `biome.json` import group per workspace package
   (`@on-record/protocol/**`).
6. `.nvmrc` (24), `.editorconfig`, as in taverla.
7. Local git identity already set (`adrienlcp@gmail.com`); check before the
   first commit.

## Done when

- `pnpm install && pnpm validate` passes locally.
- CI passes on GitHub.
- `pnpm dev` serves an empty page on `http://localhost:5480`, seen in a
  browser.

## Decide with Adrien

- Licence. Taverla is AGPL-3.0; for a civic project it keeps forks open too.
