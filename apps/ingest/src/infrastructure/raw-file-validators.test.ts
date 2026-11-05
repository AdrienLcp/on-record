import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'

import {
  validateJsonArchive,
  validateTextFile
} from '@/infrastructure/raw-file-validators.ts'

const url = 'https://data.example.fr/file'

describe('raw file validators', () => {
  it('[raw-file-validation] accepts a zip that lists a JSON file', () => {
    const bytes = zipSync({ 'json/scrutin.json': strToU8('{}') })

    expect(validateJsonArchive({ bytes, url }).status).toBe('success')
  })

  it('[raw-file-validation] refuses a zip that holds no JSON file', () => {
    const bytes = zipSync({ 'readme.txt': strToU8('maintenance') })

    expect(validateJsonArchive({ bytes, url })).toEqual({
      error: {
        code: 'invalid_raw_file',
        issues: 'the archive holds no JSON file',
        path: url
      },
      status: 'failure'
    })
  })

  it('[raw-file-validation] refuses an error page served in place of a zip', () => {
    const bytes = strToU8('<html><body>502 Bad Gateway</body></html>')

    const validation = validateJsonArchive({ bytes, url })

    expect(validation.status === 'failure' && validation.error.code).toBe(
      'unzip_failed'
    )
  })

  it('[raw-file-validation] refuses a blank text file', () => {
    const bytes = strToU8(' \n')

    expect(validateTextFile('utf-8')({ bytes, url })).toEqual({
      error: {
        code: 'invalid_raw_file',
        issues: 'the file is blank',
        path: url
      },
      status: 'failure'
    })
  })
})
