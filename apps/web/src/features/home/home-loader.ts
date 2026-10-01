import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const homeLoader = ({ signal }: { signal: AbortSignal }) => ({
  scrutins: fetchScrutinIndex(signal)
})

export const useHomeData = () => useRouteData<typeof homeLoader>()
