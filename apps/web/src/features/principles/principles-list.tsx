import type React from 'react'

import { useTranslate } from '@/presentation/i18n/i18n-provider'

import './principles-list.sass'

/** In the order of `docs/product.md`: the rules every page is held to. */
const PRINCIPLES = [
  'nominal',
  'absence',
  'object',
  'corrections',
  'groupAtDate',
  'traceable',
  'selection'
] as const

/** The site's editorial rules, in plain words. */
export const PrinciplesList: React.FC = () => {
  const translate = useTranslate()

  return (
    <ol className='principles-list ruled-list'>
      {PRINCIPLES.map((principle) => (
        <li className='principle' key={principle}>
          <p className='principle-title'>
            {translate(`principles.${principle}.title`)}
          </p>
          <p className='principle-text'>
            {translate(`principles.${principle}.text`)}
          </p>
        </li>
      ))}
    </ol>
  )
}
