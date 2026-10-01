import type React from 'react'

import './page-intro.sass'

type PageIntroProps = {
  /** Links or actions sitting above the title, such as the way back to a list. */
  before?: React.ReactNode
  children?: React.ReactNode
  lead?: React.ReactNode
  title: React.ReactNode
}

/** The page's title and the sentence that says what the page is for. */
export const PageIntro: React.FC<PageIntroProps> = ({
  before,
  children,
  lead,
  title
}) => (
  <header className='page-intro'>
    {before}
    <h1 className='page-title'>{title}</h1>
    {lead !== undefined && <p className='page-lead'>{lead}</p>}
    {children}
  </header>
)
