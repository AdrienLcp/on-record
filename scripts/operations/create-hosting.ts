import type { Result } from '@adrienlcp/result'

import { readSecret } from './bitwarden.ts'
import { HOSTING } from './hosting.ts'
import { isJsonRecord, readString, requestJson } from './json-api.ts'
import { SECRET_ENTRIES } from './secret-entries.ts'
import { exitWithError, printStep } from './shell.ts'

/**
 * `pnpm hosting:create` — creates whatever piece of the hosting is missing,
 * and leaves alone what exists: the Cloudflare Pages project, its custom
 * domain and its DNS record. Safe to run again; it never deletes.
 */

const SCOPE = 'hosting:create'
const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4'

const unwrap = (result: Result<unknown, string>): unknown =>
  result.status === 'success' ? result.data : exitWithError(SCOPE, result.error)

const unwrapSecret = (result: Result<string, string>): string =>
  result.status === 'success' ? result.data : exitWithError(SCOPE, result.error)

const cloudflareToken = unwrapSecret(readSecret(SECRET_ENTRIES.cloudflareToken))

const cloudflare = async (
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> => {
  const response = unwrap(
    await requestJson(`${CLOUDFLARE_API}${path}`, {
      body,
      method: body ? 'POST' : 'GET',
      token: cloudflareToken
    })
  )

  return isJsonRecord(response) ? response.result : undefined
}

const pagesPath = `/accounts/${HOSTING.cloudflareAccountId}/pages/projects`

/** Cloudflare answers 404 for a project that does not exist. */
const findPagesProject = async () => {
  const found = await requestJson(
    `${CLOUDFLARE_API}${pagesPath}/${HOSTING.pagesProject}`,
    { token: cloudflareToken }
  )
  if (found.status === 'failure' || !isJsonRecord(found.data)) return undefined

  return isJsonRecord(found.data.result) ? found.data.result : undefined
}

/** Created without a Git source, so a direct-upload project: the CI deploys to it. */
const ensurePagesProject = async () => {
  const existing = await findPagesProject()
  if (existing) {
    printStep(SCOPE, `Pages project ${HOSTING.pagesProject} exists`)
    return existing
  }

  const created = await cloudflare(pagesPath, {
    name: HOSTING.pagesProject,
    production_branch: 'main'
  })
  printStep(SCOPE, `Pages project ${HOSTING.pagesProject} created`)

  return isJsonRecord(created) ? created : undefined
}

const ensurePagesDomain = async () => {
  const domainsPath = `${pagesPath}/${HOSTING.pagesProject}/domains`
  const listed = await cloudflare(domainsPath)
  const domains = Array.isArray(listed) ? listed.filter(isJsonRecord) : []
  if (
    domains.some(
      (domain) => readString(domain, 'name') === HOSTING.publicDomain
    )
  ) {
    printStep(SCOPE, `${HOSTING.publicDomain} is attached to the Pages project`)
    return
  }

  await cloudflare(domainsPath, { name: HOSTING.publicDomain })
  printStep(SCOPE, `${HOSTING.publicDomain} attached to the Pages project`)
}

const ensureDnsRecord = async (pagesHost: string) => {
  const recordsPath = `/zones/${HOSTING.cloudflareZoneId}/dns_records`
  const listed = await cloudflare(`${recordsPath}?name=${HOSTING.publicDomain}`)
  const existing = (Array.isArray(listed) ? listed : []).find(isJsonRecord)
  if (existing) {
    const target = readString(existing, 'content')
    printStep(
      SCOPE,
      target === pagesHost
        ? `DNS ${HOSTING.publicDomain} → ${pagesHost} exists`
        : `DNS ${HOSTING.publicDomain} points to ${target}, not ${pagesHost}: fix it in the dashboard (DNS → Records)`
    )
    return
  }

  await cloudflare(recordsPath, {
    content: pagesHost,
    name: HOSTING.publicDomain,
    proxied: true,
    type: 'CNAME'
  })
  printStep(SCOPE, `DNS ${HOSTING.publicDomain} → ${pagesHost} created`)
}

const project = await ensurePagesProject()
const pagesHost =
  (project && readString(project, 'subdomain')) ||
  exitWithError(SCOPE, 'the Pages project has no pages.dev host to point at')

await ensurePagesDomain()
await ensureDnsRecord(pagesHost)

printStep(
  SCOPE,
  `done: keep ${pagesHost} in apps/web/public/_headers, run \`pnpm secrets:sync\` if the GitHub secrets are new, then \`pnpm ship\``
)
