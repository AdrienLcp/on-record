import { z } from 'zod'

/** An ISO day, or nothing yet. The list's notice says DD/MM/YYYY; the file writes ISO. */
const optionalDay = z
  .union([z.literal(''), z.iso.date()])
  .transform((day) => (day === '' ? null : day))

const optionalText = z
  .string()
  .transform((text) => (text.trim() === '' ? null : text.trim()))

/**
 * A file name below `/livraison/dossiers/`. Checked because it becomes a path
 * in the download cache: no separator, no leading dot.
 */
const optionalFileName = (extension: '.pdf' | '.xml') =>
  z
    .union([
      z.literal(''),
      z
        .string()
        .regex(/^[^./\\:][^/\\:]*$/)
        .refine((name) => name.endsWith(extension))
    ])
    .transform((name) => (name === '' ? null : name))

/** One row of `liste.csv`: one document of one person, for one of their mandates. */
export const rawHatvpListRowSchema = z.object({
  date_depot: optionalDay,
  date_publication: optionalDay,
  /** The person's id in the chamber's own data: the Assemblée uid without `PA`, the Senate matricule. */
  id_origine: optionalText,
  nom: z.string().min(1),
  /** The file name of the published PDF. */
  nom_fichier: optionalFileName('.pdf'),
  /** The file name of the structured XML, when the declaration is published as data. */
  open_data: optionalFileName('.xml'),
  prenom: z.string().min(1),
  statut_publication: z.enum([
    'Livrée',
    'Déclaration déposée - publication à venir',
    'Déclaration déposée - publication en préfecture à venir',
    'En cours',
    'Déclaration non déposée',
    'dispense'
  ]),
  type_document: z.string().min(1),
  type_mandat: z.string().min(1),
  /** The person's page below hatvp.fr: `/pages_nominatives/lahmar-abdelkader-27452`. */
  url_dossier: z.string().startsWith('/')
})

export type RawHatvpListRow = z.infer<typeof rawHatvpListRowSchema>
