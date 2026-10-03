import { compareFrench } from '../french-order'

type DeputyName = { firstName: string; lastName: string }

/** Orders deputies the way the ingest writes them and the site lists them: last name, then first name. */
export const compareDeputyNames = (
  first: DeputyName,
  second: DeputyName
): number =>
  compareFrench(first.lastName, second.lastName) ||
  compareFrench(first.firstName, second.firstName)
