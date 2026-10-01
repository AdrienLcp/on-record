/** The attribute that names, on `#root`, the path a document was written for. */
const PRERENDERED_PATH_ATTRIBUTE = 'data-prerendered-path'

/**
 * The host answers a path with no file of its own (an ordinary scrutin) with
 * `index.html`, which is the prerendered home page. Run right after `#root` is
 * parsed, before the first paint, this empties a page written for another
 * path, so the app renders the right one from scratch instead of the home
 * page flashing first.
 */
const GUARD_SCRIPT = `<script>(()=>{const r=document.getElementById("root");if(r!==null&&r.getAttribute("${PRERENDERED_PATH_ATTRIBUTE}")!==location.pathname)r.replaceChildren()})()</script>`

export const guardedRoot = ({
  html,
  path
}: {
  html: string
  path: string
}): string =>
  `<div id="root" ${PRERENDERED_PATH_ATTRIBUTE}="${path}">${html}</div>\n    ${GUARD_SCRIPT}`
