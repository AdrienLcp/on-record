import { fetchDirectory } from '@/features/deputies/directory-api'
import { useRouteData } from '@/infrastructure/router/navigation'

/** Who sits for each constituency; the communes come when someone searches. */
export const findMyDeputyLoader = ({ signal }: { signal: AbortSignal }) => ({
  directory: fetchDirectory(signal)
})

export const useFindMyDeputyData = () =>
  useRouteData<typeof findMyDeputyLoader>()
