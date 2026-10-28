'use client'

import { useCallback, useEffect, useState } from 'react'

import { IntroAnimation } from '@/components/landing/intro-animation'
import { BlossomStoryBackground } from '@/components/landing/blossom-story-background'
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { WorkStrip } from '@/components/landing/work-strip'
import { ProofStrip } from '@/components/landing/proof-strip'
import { IntroSection } from '@/components/landing/intro-section'
import { ProjectsSection } from '@/components/landing/projects-section'
import { ServicesSection } from '@/components/landing/services-section'
import { EngagementSummary } from '@/components/landing/engagement-section'
import { FaqSection } from '@/components/landing/faq-section'
import { StorySection } from '@/components/landing/story-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { ContactSection } from '@/components/landing/contact-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { ParticleField } from '@/components/landing/particle-field'
import { PAGE } from '@/components/landing/motion'

import type { CaseStudyMetadata } from '@/lib/case-studies'

/**
 * Section anchors that now live only on /services. `#faq` stays: the homepage
 * keeps the essential questions under that id.
 */
const MOVED_TO_SERVICES = ['#engagement']

// ── Page ─────────────────────────────────────────────────────────────────────

export function PortfolioSections({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  // Links shared before Engagement moved still say /#engagement. Without
  // this they land at the top of the homepage instead.
  useEffect(() => {
    if (MOVED_TO_SERVICES.includes(window.location.hash)) {
      window.location.replace(`/services${window.location.hash}`)
    }
  }, [])

  return (
    <div id='top' className={PAGE}>
      <IntroAnimation onDone={handleIntroDone} />
      <SiteNav />

      {/* The whole page, hero included, sits in one autumn environment. The
          wrapper is the positioning context; the video and canvases are sticky
          inside it so one viewport of pixels covers the whole scroll range. */}
      <div className='blossom-story-root relative isolate'>
        <BlossomStoryBackground />
        <ParticleField />

        <div className='relative z-10'>
          <HeroSection ready={heroReady} />
          <WorkStrip caseStudies={caseStudies} />
          <ProofStrip systemCount={caseStudies.length} />

          <div className='story-content relative'>
            <div className='relative z-10'>
              {/* The story sits between the promise and the person: what the
                  problem feels like, what the system does, what comes back. */}
              <StorySection systemCount={caseStudies.length} />

              {/* Introduce the person behind the work before the full eight-project
              portfolio. This keeps the biography near the hero without asking
              the visitor to scroll through a long project showcase first. */}
              <IntroSection systemCount={caseStudies.length} />
              <ProjectsSection caseStudies={caseStudies} />
              <ServicesSection />
              <HowItWorksSection />

              {/* How work is priced, in one band; what each includes is on
              /services. */}
              <EngagementSummary />

              {/* Corroboration immediately before the offer. Clearly labelled
              layout placeholders remain until approved client words arrive. */}
              <TestimonialsSection />

              {/* The four questions most likely to stop a booking, just above
              the form. All of them, with the FAQPage markup, are on /services. */}
              <FaqSection essentialOnly />
              <ContactSection />
              <SiteFooter />
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
