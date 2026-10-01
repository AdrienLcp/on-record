import { z } from 'zod'

/** The open data writes every number as a string. */
export const integerString = z
  .string()
  .regex(/^\d+$/)
  .transform((digits) => Number(digits))

/** The open data writes every boolean as a string. */
export const booleanString = z
  .enum(['false', 'true'])
  .transform((flag) => flag === 'true')

/** How the XML-born JSON of actors and organs says "no value". */
const xsiNilSchema = z
  .object({ '@xsi:nil': z.literal('true') })
  .transform(() => null)

/** A value the open data may leave out as `null` or as an `xsi:nil` object. */
export const nilable = <Schema extends z.ZodType>(schema: Schema) =>
  z.union([z.null(), xsiNilSchema, schema])

/** A list the XML-born JSON writes as a bare object when it holds one item. */
export const oneOrMany = <Schema extends z.ZodType>(schema: Schema) =>
  z.preprocess(
    (value) => (Array.isArray(value) ? value : [value]),
    z.array(schema)
  )
