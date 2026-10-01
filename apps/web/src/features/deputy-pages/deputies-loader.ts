import { fetchDirectory } from '@/features/deputies/directory-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const deputiesLoader = ({ signal }: { signal: AbortSignal }) => ({
  directory: fetchDirectory(signal)
})

export const useDeputiesData = () => useRouteData<typeof deputiesLoader>()
