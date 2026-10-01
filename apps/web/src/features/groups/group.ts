import {
  type OrganId,
  organIdSchema
} from '@on-record/protocol/assembly/official-ids'

export const parseGroupId = (text: string): OrganId | null => {
  const parsed = organIdSchema.safeParse(text)

  return parsed.success ? parsed.data : null
}
