// Component Imports
import Hero from '@/components/home/hero/hero'
import About from '@/components/home/about/about'
import FeaturedWorks from '@/components/shared/featured-works/featured-works'
import Experience from '@/components/home/experience/experience'
import Services from '@/components/shared/services/services'
import Testimonials from '@/components/shared/testimonials/testimonials'
import HireMe from '@/components/home/hire-me/hire-me'
import SelectService from '@/components/home/select-service/select-service'

// Data Imports
import { getCaseStudies } from '@/lib/case-studies'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`,
      name: 'Ramon A. Vallejera, Jr.',
      description: 'AI Automation Engineer based in the Philippines specializing in autonomous systems, AI workflows, and LLM integrations.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      inLanguage: 'en-US'
    }
  ]
}

const Home = async () => {
  const caseStudies = await getCaseStudies()

  return (
    <>
      <Hero />
      <About />
      <FeaturedWorks caseStudies={caseStudies} />
      <Experience />
      <Services />
      <Testimonials />
      <HireMe />
      <SelectService />

      {/* Add JSON-LD to your page */}
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
