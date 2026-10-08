import { onlyElement } from '@adrienlcp/prerender'

import { DATASETS_GENERATED_AT_ATTRIBUTE } from '../src/infrastructure/router/prerendered-markup.ts'

/** The attribute that names, on `#root`, the path a document was written for. */
const PRERENDERED_PATH_ATTRIBUTE = 'data-prerendered-path'

/**
 * The host answers a path with no file of its own (an ordinary scrutin) with
 * `index.html`, which is the prerendered home page. Run right after `#root` is
 * parsed, before the first paint, this empties a page written for another
 * path, so the app renders the right one from scratch instead of the home
 * page flashing first.
 */
const GUARD_SCRIPT = `(()=>{const r=document.getElementById("root");if(r!==null&&r.getAttribute("${PRERENDERED_PATH_ATTRIBUTE}")!==location.pathname)r.replaceChildren()})()`

/**
 * Marks `#root` with the path the document was written for and the datasets
 * it was written from, and sets the guard script right after it.
 */
export const addStalePageGuard = ({
  datasetsGeneratedAt,
  document,
  path
}: {
  datasetsGeneratedAt: string
  document: Document
  path: string
}): void => {
  const root = onlyElement({ document, selector: '#root' })

  root.setAttribute(DATASETS_GENERATED_AT_ATTRIBUTE, datasetsGeneratedAt)
  root.setAttribute(PRERENDERED_PATH_ATTRIBUTE, path)

  const script = document.createElement('script')

  script.textContent = GUARD_SCRIPT
  root.after(script)
}
