/** One JSON file read out of an open-data zip. */
export type ArchiveFile = {
  /** Path inside the zip, e.g. `json/acteur/PA1008.json`. */
  path: string
  text: string
}
