import type React from 'react'
import { useState } from 'react'

import {
  deputiesPathFor,
  useNavigateTo
} from '@/infrastructure/router/navigation'
import { Button } from '@/presentation/components/ui/button'
import { SearchField } from '@/presentation/components/ui/search-field'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './deputy-search-form.sass'

/** Searching opens the deputies list already filtered by the name typed. */
export const DeputySearchForm: React.FC = () => {
  const translate = useTranslate()
  const navigateTo = useNavigateTo()
  const [query, setQuery] = useState('')

  return (
    <search>
      <form
        className='deputy-search-form'
        onSubmit={(event) => {
          event.preventDefault()
          navigateTo(deputiesPathFor({ query: query.trim() }))
        }}
      >
        <SearchField
          className='deputy-search-field'
          label={translate('home.search.label')}
          onChange={setQuery}
          placeholder={translate('home.search.placeholder')}
          value={query}
        />
        <Button className='deputy-search-submit' type='submit'>
          {translate('home.search.submit')}
        </Button>
      </form>
    </search>
  )
}
