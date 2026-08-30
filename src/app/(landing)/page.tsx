import { PortfolioSections } from '@/components/landing/portfolio-sections'

import { getCaseStudies } from '@/lib/case-studies'
import { getPosts } from '@/lib/posts'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_APP_URL}#website`,
      name: 'Ramon A. Vallejera, Jr.',
      description:
        'AI Automation Specialist based in the Philippines specializing in n8n workflows, financial process automation, and LLM integrations.',
      url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      inLanguage: 'en-US'
    }
  ]
}

const Home = async () => {
  const caseStudies = await getCaseStudies()
  const posts = await getPosts(3)

  return (
    <>
      <PortfolioSections caseStudies={caseStudies} posts={posts} />

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
