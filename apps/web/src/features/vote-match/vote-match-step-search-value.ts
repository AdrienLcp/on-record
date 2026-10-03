import type { MatchStep } from './vote-match'

const RESULT_STEP_VALUE = 'resultat'

/** `3` is the third text, `resultat` the result; anything else is the start. */
export const parseStep = ({
  questionCount,
  value
}: {
  questionCount: number
  value: string | null
}): MatchStep => {
  if (value === RESULT_STEP_VALUE) {
    return { kind: 'result' }
  }

  const position = Number(value)

  return Number.isInteger(position) &&
    position >= 1 &&
    position <= questionCount
    ? { index: position - 1, kind: 'question' }
    : { kind: 'intro' }
}

export const stepSearchValue = (step: MatchStep): string | undefined => {
  switch (step.kind) {
    case 'intro':
      return undefined
    case 'question':
      return String(step.index + 1)
    case 'result':
      return RESULT_STEP_VALUE
  }
}
