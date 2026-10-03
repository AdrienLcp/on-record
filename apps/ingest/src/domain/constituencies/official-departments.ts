import type { DepartmentCode } from '@on-record/protocol/assembly/official-ids.ts'

/**
 * The Interior Ministry writes overseas departments and collectivities
 * with letters, in its commune table and in the constituency contours.
 * `ZZ`, French people abroad, holds no commune.
 */
const assemblyDepartmentByLetters: Record<string, DepartmentCode> = {
  ZA: '971',
  ZB: '972',
  ZC: '973',
  ZD: '974',
  ZM: '976',
  ZN: '988',
  ZP: '987',
  ZS: '975',
  ZW: '986',
  ZX: '977'
}

export const FRENCH_ABROAD_LETTERS = 'ZZ'

/** A Ministry department code (`1`, `2A`, `ZA`) → the Assemblée's (`01`, `2A`, `971`). */
export const assemblyDepartmentOf = (ministryCode: string): DepartmentCode =>
  assemblyDepartmentByLetters[ministryCode] ?? ministryCode.padStart(2, '0')

/**
 * The INSEE code of a commune of the Ministry's table. Overseas, the table
 * numbers communes on three digits after the letters, the last two being the
 * INSEE ones: `ZM 501` is Acoua, `97601`, and `ZP 11` is Anaa, `98711`.
 * Saint-Barthélemy (`977`) and Saint-Martin (`978`) share `ZX`.
 */
export const inseeCodeOfTableCommune = ({
  communeNumber,
  ministryDepartment
}: {
  communeNumber: string
  ministryDepartment: string
}): string => {
  const department = assemblyDepartmentByLetters[ministryDepartment]
  if (department === undefined) {
    return `${ministryDepartment.padStart(2, '0')}${communeNumber.padStart(3, '0')}`
  }
  const inseeDepartment =
    ministryDepartment === 'ZX' ? `97${communeNumber.charAt(0)}` : department
  return `${inseeDepartment}${communeNumber.padStart(2, '0').slice(-2)}`
}

/** INSEE files Saint-Martin under `978`; the Assemblée seats it with Saint-Barthélemy, `977`. */
export const assemblyDepartmentOfInsee = (
  inseeDepartment: string
): DepartmentCode => (inseeDepartment === '978' ? '977' : inseeDepartment)
