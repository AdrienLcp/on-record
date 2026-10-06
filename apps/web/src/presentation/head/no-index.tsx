import type React from 'react'

/**
 * Keeps a page that answers "not found" out of search results. The host
 * serves such a path with the home document and a 200, so the page says it
 * itself: React hoists the tag into the head while the page is shown.
 */
export const NoIndex: React.FC = () => <meta content='noindex' name='robots' />
