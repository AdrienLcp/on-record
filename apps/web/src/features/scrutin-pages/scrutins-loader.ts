import { fetchScrutinIndex } from '@/features/scrutins/scrutins-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const scrutinsLoader = ({ signal }: { signal: AbortSignal }) => ({
  scrutins: fetchScrutinIndex(signal)
})

export const useScrutinsData = () => useRouteData<typeof scrutinsLoader>()
