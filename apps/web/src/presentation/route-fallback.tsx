import type React from 'react'

import { LoadingLines } from '@/presentation/components/loading-lines'

import './route-fallback.sass'

/** The desk with a few empty lines while the first page's chunk downloads. */
export const RouteFallback: React.FC = () => (
  <div className='route-fallback'>
    <LoadingLines />
  </div>
)
