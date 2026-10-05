import { REPOSITORY_URL } from '@/domain/assembly-votes/assembly-sources.ts'
import type { OpenDataSource } from '@/domain/open-data-source.ts'

/** Every amendment of the legislature: ≈310 MB zipped, read one file at a time. */
export const amendmentsSource: OpenDataSource = {
  id: 'assembly-amendments',
  url: `${REPOSITORY_URL}/loi/amendements_div_legis/Amendements.json.zip`
}
