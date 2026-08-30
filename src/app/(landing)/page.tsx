import type { Metadata } from 'next'

import { PortfolioSections } from '@/components/landing/portfolio-sections'

import { getCaseStudies } from '@/lib/case-studies'
import { getPosts } from '@/lib/posts'
import { PROFILE, SERVICES } from '@/lib/portfolio'
import { abs, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL }
}

/**
 * Person + ProfessionalService describe who is selling and what is on offer.
 * WebSite alone told search engines a site exists but nothing about the
 * practice behind it, and produced no entity for a knowledge panel.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: PROFILE.name,
      url: SITE_URL,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}#person` }
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}#person`,
      name: PROFILE.name,
      alternateName: PROFILE.shortName,
      jobTitle: PROFILE.title,
      email: `mailto:${PROFILE.email}`,
      url: SITE_URL,
      image: abs('/images/landing/ramon-portrait.webp'),
      hasCredential: PROFILE.credential,
      address: { '@type': 'PostalAddress', addressCountry: 'PH' },
      knowsAbout: [
        'n8n',
        'Zapier',
        'Make.com',
        'Workflow automation',
        'Claude API',
        'OpenAI API',
        'Retrieval-Augmented Generation',
        'AI voice agents',
        'Finance operations automation'
      ],
      sameAs: PROFILE.socials.map(s => s.href)
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}#practice`,
      name: `${PROFILE.name} — AI Automation`,
      description:
        'Production automation built on n8n, Zapier and Make, with LLM integrations, RAG knowledge systems and AI voice agents.',
      url: SITE_URL,
      email: `mailto:${PROFILE.email}`,
      areaServed: 'Worldwide',
      provider: { '@id': `${SITE_URL}#person` },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Automation services',
        itemListElement: SERVICES.map(service => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            description: service.description,
            url: abs(`/services/${service.slug}`)
          }
        }))
      }
    }
  ]
}

const Home = async () => {
  const caseStudies = await getCaseStudies()
  const posts = await getPosts(3)

  return (
    <>
      <PortfolioSections caseStudies={caseStudies} posts={posts} />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
        }}
      />
    </>
  )
}

export default Home
