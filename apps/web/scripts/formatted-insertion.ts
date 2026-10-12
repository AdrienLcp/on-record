const WHITESPACE_ONLY = /^\s+$/

const TEXT_NODE = 3

/** The whitespace the document indents `node` with: the text node right before it, when it holds nothing else. */
const indentationOf = (node: ChildNode): ChildNode | null => {
  const previous = node.previousSibling

  return previous?.nodeType === TEXT_NODE &&
    WHITESPACE_ONLY.test(previous.textContent ?? '')
    ? previous
    : null
}

/**
 * Puts `nodes` right after `reference`, each on a line of its own indented as
 * `reference` is, so the document reads as the shell was written. Only for
 * the head and what follows the root: a text node inside the root is markup
 * hydration compares.
 */
export const placeAfter = ({
  nodes,
  reference
}: {
  nodes: readonly Node[]
  reference: ChildNode
}): void => {
  const indentation = indentationOf(reference)

  reference.after(
    ...(indentation === null
      ? nodes
      : nodes.flatMap((node) => [indentation.cloneNode(), node]))
  )
}

/** Puts `nodes` right before `reference`, each on a line of its own indented as `reference` is. */
export const placeBefore = ({
  nodes,
  reference
}: {
  nodes: readonly Node[]
  reference: ChildNode
}): void => {
  const indentation = indentationOf(reference)

  reference.before(
    ...(indentation === null
      ? nodes
      : nodes.flatMap((node) => [node, indentation.cloneNode()]))
  )
}
