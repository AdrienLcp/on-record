import { fetchDirectory } from '@/features/deputies/directory-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const groupsLoader = ({ signal }: { signal: AbortSignal }) => ({
  directory: fetchDirectory(signal)
})

export const useGroupsData = () => useRouteData<typeof groupsLoader>()
