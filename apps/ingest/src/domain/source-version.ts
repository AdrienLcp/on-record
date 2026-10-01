/** What a server said about a file's version, sent back to ask "has it changed?". */
export type SourceValidators = {
  etag: string | null
  lastModified: string | null
}

/**
 * Whether a downloaded file is a newer version than the cached one. The
 * Assemblée's server sometimes answers from a stale replica with an older
 * file and a different `ETag`: a download whose `Last-Modified` is not later
 * than the cached one is never taken as a change.
 */
export const isNewerVersion = ({
  cached,
  downloaded
}: {
  cached: SourceValidators | null
  downloaded: SourceValidators
}): boolean => {
  if (cached?.lastModified == null || downloaded.lastModified === null) {
    return true
  }
  return Date.parse(downloaded.lastModified) > Date.parse(cached.lastModified)
}

/**
 * A server that sends neither `ETag` nor `Last-Modified` (insee.fr) answers
 * every request with the whole file: only its bytes tell whether it changed.
 */
export const hasNoValidators = (validators: SourceValidators): boolean =>
  validators.etag === null && validators.lastModified === null

export const isSameContent = ({
  cached,
  downloaded
}: {
  cached: Uint8Array
  downloaded: Uint8Array
}): boolean =>
  cached.byteLength === downloaded.byteLength &&
  cached.every((byte, index) => byte === downloaded[index])
