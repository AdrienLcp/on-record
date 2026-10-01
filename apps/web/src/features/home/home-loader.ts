import { fetchHighlights } from '@/features/scrutins/scrutins-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const homeLoader = ({ signal }: { signal: AbortSignal }) => ({
  highlights: fetchHighlights(signal)
})

export const useHomeData = () => useRouteData<typeof homeLoader>()
