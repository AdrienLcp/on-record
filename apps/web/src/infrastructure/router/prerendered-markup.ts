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
