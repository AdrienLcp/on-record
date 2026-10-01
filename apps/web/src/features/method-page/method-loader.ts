import { fetchDatasetsMeta } from '@/features/sources/sources-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const methodLoader = ({ signal }: { signal: AbortSignal }) => ({
  meta: fetchDatasetsMeta(signal)
})

export const useMethodData = () => useRouteData<typeof methodLoader>()
