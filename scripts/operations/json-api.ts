import { Result } from '@adrienlcp/result'

export type JsonRecord = Record<string, unknown>

export const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const readString = (record: JsonRecord, key: string) => {
  const value = record[key]

  return typeof value === 'string' ? value : undefined
}

type JsonRequest = {
  body?: JsonRecord
  method?: 'GET' | 'POST'
  token: string
}

const parseJson = (text: string): Result<unknown, string> => {
  if (!text) return Result.success(null)

  try {
    const parsed: unknown = JSON.parse(text)

    return Result.success(parsed)
  } catch {
    return Result.failure(`answered something that is not JSON: ${text}`)
  }
}

const send = async (
  url: string,
  { body, method = 'GET', token }: JsonRequest
): Promise<Result<Response, string>> => {
  try {
    return Result.success(
      await fetch(url, {
        body: body && JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method
      })
    )
  } catch {
    return Result.failure(`${method} ${url} did not answer: is the network up?`)
  }
}

/** Calls a JSON API with a bearer token; the token never reaches the console. */
export const requestJson = async (
  url: string,
  request: JsonRequest
): Promise<Result<unknown, string>> => {
  const method = request.method ?? 'GET'
  const sent = await send(url, request)
  if (sent.status === 'failure') return sent

  const text = await sent.data.text()
  if (!sent.data.ok) {
    return Result.failure(
      `${method} ${url} answered ${sent.data.status}: ${text}`
    )
  }

  const parsed = parseJson(text)

  return parsed.status === 'success'
    ? parsed
    : Result.failure(`${method} ${url} ${parsed.error}`)
}
