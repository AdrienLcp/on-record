import { appendFile } from 'node:fs/promises'

import { Result } from '@adrienlcp/result'

/**
 * Sets an output of the current GitHub Actions step (`steps.<id>.outputs.<name>`)
 * by appending to the file `GITHUB_OUTPUT` names.
 */
export const writeStepOutput = async ({
  name,
  outputFile,
  value
}: {
  name: string
  outputFile: string
  value: string
}): Promise<Result<void, 'unwritable'>> => {
  try {
    await appendFile(outputFile, `${name}=${value}\n`)
    return Result.success()
  } catch {
    return Result.failure('unwritable')
  }
}
