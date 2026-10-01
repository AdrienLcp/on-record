/** What a server said about a file's version, sent back to ask "has it changed?". */
export type ArchiveValidators = {
  etag: string | null
  lastModified: string | null
}

/**
 * Whether a downloaded zip is a newer version than the cached one. The
 * Assemblée's server sometimes answers from a stale replica with an older
 * file and a different `ETag`: a download whose `Last-Modified` is not later
 * than the cached one is never taken as a change.
 */
export const isNewerArchive = ({
  cached,
  downloaded
}: {
  cached: ArchiveValidators | null
  downloaded: ArchiveValidators
}): boolean => {
  if (cached?.lastModified == null || downloaded.lastModified === null) {
    return true
  }
  return Date.parse(downloaded.lastModified) > Date.parse(cached.lastModified)
}
