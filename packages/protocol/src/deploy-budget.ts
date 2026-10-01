/**
 * Files one deployment may publish, datasets and prerendered pages together:
 * well under the host's 20,000 per deployment (`docs/architecture.md`). Ingest
 * checks the datasets against it, the web build checks its whole output.
 */
export const MAX_PUBLISHED_FILES = 15_000
