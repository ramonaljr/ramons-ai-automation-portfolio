import type { Metadata } from 'next'

import { LegalPage } from '@/components/landing/legal-page'
import { TERMS } from '@/lib/legal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Terms of service',
  description: TERMS.intro,
  path: '/terms'
})

const TermsPage = () => <LegalPage label='TERMS' {...TERMS} />

export default TermsPage
