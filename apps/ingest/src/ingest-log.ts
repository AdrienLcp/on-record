/** One structured log line: an event name and its fields, as JSON on stdout. */
export const logEvent = (event: string, fields: object = {}): void => {
  console.info(JSON.stringify({ event, ...fields }))
}

/** Same shape as `logEvent`, on stderr. */
export const logFailure = (event: string, fields: object = {}): void => {
  console.error(JSON.stringify({ event, ...fields }))
}
