# Operations

Everything needed to run this site without help: one page per action, each
with its prerequisites, the exact command, what a good run prints, and the
errors met most often.

| Action                         | Command               | Page                                                 |
| ------------------------------ | --------------------- | ---------------------------------------------------- |
| Deploy                         | `pnpm ship`           | [deploying.md](deploying.md)                         |
| Refresh the data now           | `gh workflow run`     | [deploying.md](deploying.md), _The nightly refresh_  |
| Update the dependencies        | `pnpm deps:upgrade`   | [updating-dependencies.md](updating-dependencies.md) |
| Create or recreate the hosting | `pnpm hosting:create` | [hosting.md](hosting.md)                             |
| Set or renew the secrets       | `pnpm secrets:sync`   | [secrets.md](secrets.md)                             |
| A step broke                   | —                     | [troubleshooting.md](troubleshooting.md)             |

## Where things live

| What                  | Where                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The site              | https://on-record.adrienlcp.com — Cloudflare Pages project `on-record`, deployed by `.github/workflows/refresh.yml`                         |
| Repository            | `AdrienLcp/on-record` on GitHub; a push to `main` runs `.github/workflows/ci.yml` (validates) and `.github/workflows/refresh.yml` (deploys) |
| The data              | Ingested in CI by `refresh.yml` every morning at 07:00 UTC and on every push; the datasets live in that workflow's cache, never in the repo |
| Secrets               | The personal Bitwarden account, read at run time; never a file in this repository, never a `.env`                                           |
| Hosting identifiers   | `scripts/operations/hosting.ts`                                                                                                             |
| Bitwarden entry names | `scripts/operations/secret-entries.ts`                                                                                                      |

## Tools on the machine

- Node 26 and pnpm through corepack (`corepack enable`), as `package.json` pins them.
- The Bitwarden CLI, `bw` — set up once, see [secrets.md](secrets.md).
- The GitHub CLI, `gh`, logged in (`gh auth status`) — `pnpm ship` uses it to
  follow the two workflow runs, and it starts a data refresh by hand. Without
  it, `pnpm ship` still pushes and prints the Actions page to watch.
