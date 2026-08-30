import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { ServiceDetail } from '@/components/landing/service-detail'

import { SERVICES } from '@/lib/portfolio'

export async function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES.find(s => s.slug === slug)

  if (!service) return {}

  return {
    title: service.title,
    description: service.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/services/${service.slug}`
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

  return <ServiceDetail service={service} others={SERVICES.filter(s => s.slug !== slug)} />
}

export default ServicePage
