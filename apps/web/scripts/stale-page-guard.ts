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

/** What `#root` carries for a page written for `path`, and the script set right after it. */
export const stalePageGuardFor = ({
  datasetsGeneratedAt,
  path
}: {
  datasetsGeneratedAt: string
  path: string
}): { attributes: Record<string, string>; script: string } => ({
  attributes: {
    [DATASETS_GENERATED_AT_ATTRIBUTE]: datasetsGeneratedAt,
    [PRERENDERED_PATH_ATTRIBUTE]: path
  },
  script: GUARD_SCRIPT
})
