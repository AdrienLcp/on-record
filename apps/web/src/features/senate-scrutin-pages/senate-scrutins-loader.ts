import { fetchSenateScrutinIndex } from '@/features/senate-scrutins/senate-scrutins-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const senateScrutinsLoader = ({ signal }: { signal: AbortSignal }) => ({
  index: fetchSenateScrutinIndex(signal)
})

export const useSenateScrutinsData = () =>
  useRouteData<typeof senateScrutinsLoader>()
