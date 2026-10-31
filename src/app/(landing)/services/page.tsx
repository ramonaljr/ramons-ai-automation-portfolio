import type { Metadata } from 'next'

// Component Imports
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { PageScene } from '@/components/landing/page-scene'
import { ServicesSection } from '@/components/landing/services-section'
import { EngagementSection } from '@/components/landing/engagement-section'
import { FaqSection } from '@/components/landing/faq-section'
import { CONTAINER, DISPLAY_FONT, PAGE } from '@/components/landing/motion'

// Data Imports
import { FAQS } from '@/lib/portfolio'
import { breadcrumbLd, graph, pageMetadata, PERSON_ID } from '@/lib/seo'
import { abs, SITE_URL } from '@/lib/site'

const URL = abs('/services')

const DESCRIPTION =
  'What I build, how a project is priced and run, and answers about access, ownership and reliability: audit, fixed-price build or retainer, all agreed up front.'

export const metadata: Metadata = pageMetadata({
  title: 'Services, pricing and FAQ',
  description: DESCRIPTION,
  path: '/services'
})

/**
 * The FAQPage node moved here with the questions. Its markup has to describe
 * questions visible on the page that carries it, so it left the homepage's
 * graph when the FAQ did; it is built from the same `FAQS` the section
 * renders, so the two cannot drift.
 */
const jsonLd = graph(
  {
    '@type': 'WebPage',
    '@id': `${URL}#webpage`,
    name: 'Services, pricing and FAQ',
    description: DESCRIPTION,
    url: URL,
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: { '@id': PERSON_ID }
  },
  {
    '@type': 'FAQPage',
    '@id': `${URL}#faq`,
    mainEntity: FAQS.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  },
  breadcrumbLd([
    { name: 'Home', url: abs('') },
    { name: 'Services', url: URL }
  ])
)

/**
 * Everything a buyer checks before booking a call, on one page: the offer,
 * how it is priced and run, and the questions. Engagement and the FAQ used to
 * close the homepage, adding about 3,000px between the work and the contact
 * form; the homepage keeps the offer and one line pointing here.
 */
const ServicesPage = () => {
  return (
    <div className={PAGE}>
      <SiteNav />

      <div className='relative'>
        <ParticleField />

        <div className='relative z-10'>
          <header className='relative isolate px-6 pt-36 pb-4 md:px-12 lg:px-20 lg:pt-44'>
            <PageScene />
            <div className={CONTAINER}>
              <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
                SERVICES
              </span>

              <h1
                data-leaf-clear
                className='text-ink mt-7 max-w-[16ch] text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.02] font-light tracking-tight'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Services, pricing and questions.
              </h1>

              <p className='text-ink-3 mt-7 max-w-2xl text-[16px] leading-relaxed'>
                What I build, how a project is priced and run, and straight answers about access, ownership and what
                happens when something fails. Every price is agreed in writing before work starts.
              </p>

              <nav aria-label='On this page' className='services-page-jump'>
                <a href='#services'>What I build</a>
                <a href='#engagement'>Working together</a>
                <a href='#faq'>Questions</a>
              </nav>
            </div>
          </header>

          <ServicesSection />
          <EngagementSection />
          <FaqSection />
          <SiteFooter />
        </div>
      </div>

      <ChatWidget />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}

export default ServicesPage
