/**
 * The attribute that dates, on `#root`, the datasets a prerendered page was
 * written from: their `generatedAt` in `meta.json`.
 */
export const DATASETS_GENERATED_AT_ATTRIBUTE = 'data-datasets-generated-at'

/**
 * Whether `#root` holds a prerendered page the app can take over in place.
 * The prerender wrote that page for its path alone, with no filter in the
 * query: a document served for another path has already been emptied by its
 * guard script, and a filtered list renders other lines than the ones written.
 */
export const prerenderedMarkupOf = (
  container: HTMLElement
): 'absent' | 'hydratable' | 'stale' => {
  if (!container.hasChildNodes()) {
    return 'absent'
  }

  return window.location.search === '' ? 'hydratable' : 'stale'
}

/**
 * A deployment that lands while a page loads serves that page's data from the
 * next build: the written page then shows other numbers than the ones the app
 * renders, and hydration cannot take it over. `undefined` is datasets the app
 * could not read, which match no written page either.
 */
export const writtenFromTheServedDatasets = ({
  container,
  servedDatasetsGeneratedAt
}: {
  container: HTMLElement
  servedDatasetsGeneratedAt: string | undefined
}): boolean =>
  container.getAttribute(DATASETS_GENERATED_AT_ATTRIBUTE) ===
  servedDatasetsGeneratedAt
