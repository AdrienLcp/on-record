import { fetchComparison } from '@/features/compare-page/compare-loader'
import { fetchHighlights } from '@/features/scrutins/scrutins-api'
import { useRouteData } from '@/infrastructure/router/navigation'

export const voteMatchLoader = ({ signal }: { signal: AbortSignal }) => ({
  comparison: fetchComparison(signal),
  highlights: fetchHighlights(signal)
})

export const useVoteMatchData = () => useRouteData<typeof voteMatchLoader>()
