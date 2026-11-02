import type { Metadata } from 'next'

import { LegalPage } from '@/components/landing/legal-page'
import { PRIVACY } from '@/lib/legal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Privacy policy',
  description: PRIVACY.intro,
  path: '/privacy'
})

const PrivacyPage = () => <LegalPage label='PRIVACY' {...PRIVACY} />

export default PrivacyPage
