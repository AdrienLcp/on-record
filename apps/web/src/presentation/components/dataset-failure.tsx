import type React from 'react'

import type { DatasetError } from '@/infrastructure/api/datasets-api'
import { useTranslate } from '@/presentation/i18n/i18n-provider'
import { datasetErrorKey } from '@/presentation/i18n/translation'

import './dataset-failure.sass'

type DatasetFailureProps = {
  error: DatasetError
  /** Says what is missing, such as an unknown deputy, rather than the generic sentence. */
  missingMessage?: string
}

/**
 * What a region shows when its data could not be read, in place of the data:
 * never a blank. A superseded request shows nothing, since its page is gone.
 */
export const DatasetFailure: React.FC<DatasetFailureProps> = ({
  error,
  missingMessage
}) => {
  const translate = useTranslate()

  if (error === 'aborted') {
    return null
  }

  return (
    <p className='dataset-failure' role='alert'>
      {error === 'missing' && missingMessage !== undefined
        ? missingMessage
        : translate(datasetErrorKey(error))}
    </p>
  )
}
