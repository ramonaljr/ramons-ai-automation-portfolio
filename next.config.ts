import type { NextConfig } from 'next'

/**
 * Retired case-study URLs, so indexed or already-shared links still resolve.
 *
 * Two generations: slugs carried over from the template this site was built
 * on, and the six demo projects replaced by real n8n builds. Each points at
 * the live project closest to what it described, or at the work section when
 * nothing is close. Targets are final pages, never another retired slug.
 *
 * Permanent, so search engines transfer rather than keeping both.
 */
const WORK = '/#portfolio'

const RETIRED_CASE_STUDIES: Record<string, string> = {
  // Template slugs.
  'building-a-perfect-design-system-from-zero': '/case-study/ai-invoice-processing-approval',
  'launching-a-marketing-site-in-5-days': WORK,
  'prototyping-an-onboarding-flow-that-actually-converts': '/case-study/hotel-employee-onboarding',
  'redesigning-the-core-dashboard-of-saas-product': '/case-study/ai-appointment-setter',

  // Demo projects.
  'invoice-processing-gl-reconciliation': '/case-study/ai-invoice-processing-approval',
  'ai-voice-receptionist': '/case-study/ai-appointment-setter',
  'lead-routing-and-crm-enrichment': '/case-study/solar-lead-scoring-follow-up',
  'zero-touch-client-onboarding': '/case-study/hotel-employee-onboarding',
  'rag-knowledge-base': WORK,
  'multi-channel-order-sync': WORK
}

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  redirects: async () =>
    Object.entries(RETIRED_CASE_STUDIES).map(([from, to]) => ({
      source: `/case-study/${from}`,
      destination: to,
      permanent: true
    }))
}

export default nextConfig
