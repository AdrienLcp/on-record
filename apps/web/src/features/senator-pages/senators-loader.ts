import { fetchSenateDirectory } from '@/features/senators/senators-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const senatorsLoader = ({ signal }: { signal: AbortSignal }) => ({
  directory: fetchSenateDirectory(signal)
})

export const useSenatorsData = () => useRouteData<typeof senatorsLoader>()
