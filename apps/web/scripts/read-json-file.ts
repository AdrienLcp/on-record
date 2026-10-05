import { readFile } from 'node:fs/promises'

import type { z } from 'zod'

/** A JSON file the build reads, checked against the shape it must have. */
export const readJsonFile = async <Schema extends z.ZodType>(
  path: string,
  schema: Schema
): Promise<z.infer<Schema>> =>
  schema.parse(JSON.parse(await readFile(path, 'utf8')))
