'use client'

import { useCallback, useState, type CSSProperties } from 'react'

import { IntroAnimation } from '@/components/landing/intro-animation'
import { BlossomStoryBackground } from '@/components/landing/blossom-story-background'
import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { IntroSection } from '@/components/landing/intro-section'
import { ProjectsSection } from '@/components/landing/projects-section'
import { ServicesSection } from '@/components/landing/services-section'
import { EngagementSection } from '@/components/landing/engagement-section'
import { StorySection } from '@/components/landing/story-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { ContactSection } from '@/components/landing/contact-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FaqSection } from '@/components/landing/faq-section'
import { ChatWidget } from '@/components/landing/chat-widget'
import { MobileBookCta } from '@/components/landing/mobile-book-cta'
import { ParticleField } from '@/components/landing/particle-field'
import { ScrollAtmosphere } from '@/components/landing/scroll-atmosphere'
import { PAGE } from '@/components/landing/motion'

import type { CaseStudyMetadata } from '@/lib/case-studies'
import { TESTIMONIALS } from '@/lib/portfolio'

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * The numbered chapters below, for the side counter's "NN / total". Testimonials
 * only counts once a real quote is published, because until then it renders
 * nothing. Keep this list in step with the sections in the JSX.
 */
const CHAPTERS = ['about', 'portfolio', 'services', 'process', 'testimonials', 'engagement', 'faq', 'contact'].filter(
  id => id !== 'testimonials' || TESTIMONIALS.some(testimonial => !testimonial.draft)
)

export function PortfolioSections({ caseStudies }: { caseStudies: CaseStudyMetadata[] }) {
  const [heroReady, setHeroReady] = useState(false)
  const handleIntroDone = useCallback(() => setHeroReady(true), [])

  return (
    <div id='top' className={PAGE}>
      <IntroAnimation onDone={handleIntroDone} />
      <SiteNav />

      {/* The whole page, hero included, sits in one autumn environment. The
          wrapper is the positioning context; the video and canvases are sticky
          inside it so one viewport of pixels covers the whole scroll range. */}
      <div
        className='blossom-story-root relative isolate'
        style={{ '--chapter-total': `'${String(CHAPTERS.length).padStart(2, '0')}'` } as CSSProperties}
      >
        <BlossomStoryBackground />
        <ParticleField />

        <div className='relative z-10'>
          <HeroSection ready={heroReady} systemCount={caseStudies.length} />

          {/* The three-act story layer starts at About, not the hero: its own
              wrapper keeps "01 / The old way" from opening over the headline. */}
          <div className='story-content relative'>
            <ScrollAtmosphere />

            <div className='relative z-10'>
              {/* The story sits between the promise and the person: what the
                  problem feels like, what the system does, what comes back. */}
              <StorySection systemCount={caseStudies.length} />

              {/* Introduce the person behind the work before the full eight-project
              portfolio. This keeps the biography near the hero without asking
              the visitor to scroll through a long project showcase first. */}
              <IntroSection />
              <ProjectsSection caseStudies={caseStudies} />
              <ServicesSection />
              <HowItWorksSection />

              {/* Corroboration immediately before the offer. Clearly labelled
              layout placeholders remain until approved client words arrive. */}
              <TestimonialsSection />
              <EngagementSection />
              <FaqSection />
              <ContactSection />
              <SiteFooter />
            </div>
          </div>
        </div>
      </div>

      <MobileBookCta />
      <ChatWidget />
    </div>
  )
}
