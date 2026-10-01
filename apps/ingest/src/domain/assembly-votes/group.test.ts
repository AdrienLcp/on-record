import { describe, expect, it } from 'vitest'

import { toGroup } from '@/domain/assembly-votes/group.ts'
import {
  isLegislatureGroupFile,
  rawGroupFileSchema
} from '@/domain/assembly-votes/raw-organ.ts'

import organAssembly from '../../../test/fixtures/organ-assembly.json' with {
  type: 'json'
}
import organGroup from '../../../test/fixtures/organ-group.json' with {
  type: 'json'
}

describe('toGroup', () => {
  it('[groups] keeps the political groups of the legislature and no other organ', () => {
    expect(isLegislatureGroupFile(organGroup)).toBe(true)
    expect(isLegislatureGroupFile(organAssembly)).toBe(false)
  })

  it('[groups] reads the official colour and the short name of a group', () => {
    const group = toGroup(rawGroupFileSchema.parse(organGroup).organe)

    expect(group).toMatchObject({
      color: '#FFD96F',
      id: 'PO845485',
      shortName: 'LIOT',
      to: null
    })
  })
})
