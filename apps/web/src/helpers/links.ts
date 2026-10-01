const TABNABBING_SAFE_REL = 'noopener noreferrer'

/**
 * A `target="_blank"` link hands the opened page a `window.opener` it can use
 * to redirect this tab, unless the caller already chose a `rel` of its own.
 */
export const relForTarget = ({
  rel,
  target
}: {
  rel?: string
  target?: string
}): string | undefined =>
  target === '_blank' ? (rel ?? TABNABBING_SAFE_REL) : rel
