import type React from 'react'
import { Suspense, use, useState } from 'react'

import { type Commune, isSplitCommune } from '@/features/communes/commune'
import { CommuneField } from '@/features/communes/commune-field'
import { useCommunes } from '@/features/communes/use-communes'
import type { Directory } from '@/features/deputies/directory-api'
import type { AddressMatch } from '@/infrastructure/base-adresse/base-adresse-client'
import { useSearchValue } from '@/infrastructure/router/navigation'
import { DatasetFailure } from '@/presentation/components/dataset-failure'
import { LoadingLines } from '@/presentation/components/loading-lines'
import { Main } from '@/presentation/components/main'
import { PageIntro } from '@/presentation/components/page-intro'
import { RecordCard } from '@/presentation/components/record-card'
import { TextLink } from '@/presentation/components/ui/text-link'
import { useDocumentTitle } from '@/presentation/head/use-document-title'
import { useTranslate } from '@/presentation/i18n/i18n-provider'

import { AddressField } from './address-field'
import { CommuneSeats } from './commune-seats'
import { useFindMyDeputyData } from './find-my-deputy-loader'
import { SeatCard } from './seat-card'
import { useSeatAtAddress } from './use-seat-at-address'

import './find-my-deputy-page.sass'

/** The files this page reads, each cited where it is used. */
const FINDER_SOURCES = [
  {
    key: 'communeTable',
    url: 'https://www.data.gouv.fr/datasets/circonscriptions-legislatives-table-de-correspondance-des-communes-et-des-cantons-pour-les-elections-legislatives-de-2012-et-sa-mise-a-jour-pour-les-elections-legislatives-2017/'
  },
  {
    key: 'communes',
    url: 'https://www.insee.fr/fr/information/8740218'
  },
  {
    key: 'postcodes',
    url: 'https://www.data.gouv.fr/datasets/base-officielle-des-codes-postaux/'
  },
  {
    key: 'contours',
    url: 'https://www.data.gouv.fr/datasets/contours-geographiques-des-circonscriptions-legislatives/'
  },
  {
    key: 'addresses',
    url: 'https://adresse.data.gouv.fr/'
  }
] as const

const FinderSources: React.FC = () => {
  const translate = useTranslate()

  return (
    <RecordCard
      className='finder-sources'
      heading={translate('findMyDeputy.sources.title')}
    >
      <ul className='ruled-list'>
        {FINDER_SOURCES.map(({ key, url }) => (
          <li key={key}>
            <TextLink href={url} target='_blank'>
              {translate(`findMyDeputy.sources.${key}`)}
            </TextLink>
          </li>
        ))}
      </ul>
      <p className='record-note'>{translate('findMyDeputy.sources.licence')}</p>
    </RecordCard>
  )
}

const SplitCommuneAnswer: React.FC<{
  commune: Commune
  directory: Directory
}> = ({ commune, directory }) => {
  const translate = useTranslate()
  const [address, setAddress] = useState<AddressMatch | null>(null)
  const seatAtAddress = useSeatAtAddress({ address, commune })

  return (
    <>
      <RecordCard heading={translate('findMyDeputy.address.title')}>
        <p className='record-note'>
          {translate('findMyDeputy.split.lead', {
            commune: commune.name,
            count: commune.constituencies.length
          })}
        </p>
        <AddressField commune={commune} onSelect={setAddress} />
        <p className='record-note'>
          {translate('findMyDeputy.address.privacy')}
        </p>
      </RecordCard>
      {seatAtAddress.status === 'locating' && <LoadingLines lines={3} />}
      {seatAtAddress.status === 'failed' && (
        <DatasetFailure error={seatAtAddress.error} />
      )}
      {seatAtAddress.status === 'unplaced' && (
        <p className='finder-unplaced' role='status'>
          {translate('findMyDeputy.address.unplaced')}
        </p>
      )}
      {seatAtAddress.status === 'located' && address !== null && (
        <SeatCard
          deputies={directory.deputies}
          groups={directory.groups}
          place={address.label}
          seat={seatAtAddress.seat}
        />
      )}
      <RecordCard
        heading={translate('findMyDeputy.split.title', {
          commune: commune.name
        })}
      >
        <CommuneSeats commune={commune} deputies={directory.deputies} />
      </RecordCard>
    </>
  )
}

const CommuneAnswer: React.FC<{ commune: Commune }> = ({ commune }) => {
  const { directory } = useFindMyDeputyData()
  const result = use(directory)

  if (result.status === 'failure') {
    return <DatasetFailure error={result.error} />
  }

  const [constituency] = commune.constituencies

  if (isSplitCommune(commune) || constituency === undefined) {
    return (
      <SplitCommuneAnswer
        commune={commune}
        directory={result.data}
        key={commune.code}
      />
    )
  }

  return (
    <SeatCard
      deputies={result.data.deputies}
      groups={result.data.groups}
      place={commune.name}
      seat={{ constituency, department: commune.department }}
    />
  )
}

const Finder: React.FC = () => {
  const translate = useTranslate()
  const [communeCode, setCommuneCode] = useSearchValue('commune')
  const communes = useCommunes(communeCode !== null)
  const commune =
    communes.status === 'ready'
      ? (communes.communes.find(({ code }) => code === communeCode) ?? null)
      : null
  const isReadingChosenCommune =
    communeCode !== null &&
    (communes.status === 'idle' || communes.status === 'loading')

  return (
    <>
      <RecordCard heading={translate('findMyDeputy.commune.title')}>
        {isReadingChosenCommune ? (
          <LoadingLines lines={2} />
        ) : (
          <CommuneField
            initialQuery={commune?.name}
            onSelect={(chosen) => setCommuneCode(chosen.code)}
          />
        )}
        <p className='record-note'>{translate('findMyDeputy.commune.note')}</p>
      </RecordCard>
      {communes.status === 'failed' && (
        <DatasetFailure error={communes.error} />
      )}
      {communes.status === 'ready' &&
        communeCode !== null &&
        commune === null && (
          <p className='finder-unplaced' role='status'>
            {translate('findMyDeputy.commune.unknown')}
          </p>
        )}
      {commune !== null && (
        <Suspense fallback={<LoadingLines lines={4} />}>
          <CommuneAnswer commune={commune} key={commune.code} />
        </Suspense>
      )}
    </>
  )
}

export const FindMyDeputyPage: React.FC = () => {
  const translate = useTranslate()

  useDocumentTitle(translate('findMyDeputy.title'))

  return (
    <Main className='find-my-deputy-page'>
      <PageIntro
        lead={translate('findMyDeputy.lead')}
        title={translate('findMyDeputy.title')}
      />
      <div className='finder'>
        <Finder />
        <FinderSources />
      </div>
    </Main>
  )
}
