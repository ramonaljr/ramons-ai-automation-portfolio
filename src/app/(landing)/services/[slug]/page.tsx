import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ServiceDetail } from '@/components/landing/service-detail'

import { PROFILE, SERVICES } from '@/lib/portfolio'
import { breadcrumbLd, graph, metaDescription, PERSON_ID } from '@/lib/seo'
import { abs } from '@/lib/site'

export async function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES.find(s => s.slug === slug)

  if (!service) return {}

  return {
    title: service.title,
    description: metaDescription(service.description),
    alternates: {
      canonical: abs(`/services/${service.slug}`)
    }
  }
}

export const dynamicParams = false

const ServicePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const service = SERVICES.find(s => s.slug === slug)

  if (!service) {
    notFound()
  }

  const url = abs(`/services/${service.slug}`)

  // Service and trail markup, so a search or answer engine can name what is
  // offered, by whom, and where it sits on the site. The provider points at the
  // Person node the homepage already declares, rather than restating it.
  const jsonLd = graph(
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.title,
      description: service.description,
      url,
      serviceType: service.short,
      areaServed: 'Worldwide',
      provider: { '@id': PERSON_ID, '@type': 'Person', name: PROFILE.name },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: `What is included in ${service.short}`,
        itemListElement: service.includes.map(item => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item }
        }))
      }
    },
    breadcrumbLd([
      { name: 'Home', url: abs('') },
      { name: 'Services', url: abs('/services') },
      { name: service.title, url }
    ])
  )

  return (
    <>
      <ServiceDetail service={service} others={SERVICES.filter(s => s.slug !== slug)} />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  )
}

export default ServicePage
