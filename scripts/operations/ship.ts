import { setTimeout as wait } from 'node:timers/promises'

import { HOSTING } from './hosting.ts'
import { exitWithError, printStep, readCommand, runCommand } from './shell.ts'

/**
 * `pnpm ship` — pushes `main`, then watches the two workflows the push starts:
 * `ci.yml` validates it, `refresh.yml` ingests, builds, gates on Lighthouse
 * and deploys it. Nothing is built or deployed from this machine.
 */

const SCOPE = 'ship'
const WORKFLOWS = ['ci.yml', 'refresh.yml'] as const
const RUN_LOOKUP_ATTEMPTS = 15
const RUN_LOOKUP_INTERVAL_MS = 2000
const ACTIONS_URL = `https://github.com/${HOSTING.githubRepository}/actions`

const read = (command: string) => readCommand(command).stdout

if (read('git branch --show-current') !== 'main') {
  exitWithError(SCOPE, 'only main deploys: switch to main first')
}
if (read('git status --porcelain')) {
  exitWithError(
    SCOPE,
    'the working tree has uncommitted changes: commit or stash them first'
  )
}
if (!runCommand('git fetch --quiet origin main')) {
  exitWithError(SCOPE, 'could not reach origin')
}
if (read('git rev-list --count HEAD..origin/main') !== '0') {
  exitWithError(
    SCOPE,
    'origin/main has commits this checkout lacks: run `git pull --rebase` first'
  )
}
if (read('git rev-list --count origin/main..HEAD') === '0') {
  exitWithError(SCOPE, 'nothing to ship: origin/main already has every commit')
}

const commit = read('git rev-parse HEAD')
if (!runCommand('git push origin main')) {
  exitWithError(SCOPE, 'git push failed, nothing deployed')
}

const findRun = async (
  workflow: string,
  attemptsLeft: number
): Promise<string> => {
  const { stdout } = readCommand(
    `gh run list -R ${HOSTING.githubRepository} --workflow ${workflow} --commit ${commit} --json databaseId -q ".[0].databaseId"`
  )
  if (stdout || attemptsLeft <= 1) return stdout
  await wait(RUN_LOOKUP_INTERVAL_MS)

  return findRun(workflow, attemptsLeft - 1)
}

const watchRun = async (workflow: string) => {
  const runId = await findRun(workflow, RUN_LOOKUP_ATTEMPTS)
  if (!runId) {
    printStep(SCOPE, `pushed; follow the ${workflow} run on ${ACTIONS_URL}`)
    process.exit(0)
  }

  printStep(SCOPE, `pushed; watching the ${workflow} run ${runId}`)
  if (
    !runCommand(
      `gh run watch ${runId} -R ${HOSTING.githubRepository} --exit-status`
    )
  ) {
    exitWithError(
      SCOPE,
      `the ${workflow} run failed: ${ACTIONS_URL}/runs/${runId} — see docs/operations/troubleshooting.md`
    )
  }
}

for (const workflow of WORKFLOWS) {
  await watchRun(workflow)
}

printStep(SCOPE, `deployed to https://${HOSTING.publicDomain}`)
