import type { NextConfig } from 'next'

/**
 * Case-study slugs carried over from the template this site was built on, and
 * described the wrong project entirely — the invoice pipeline lived at
 * `building-a-perfect-design-system-from-zero`. They were renamed to match
 * their content; these keep any indexed or already-shared URL resolving.
 *
 * Permanent, so search engines transfer rather than keeping both.
 */
const RENAMED_CASE_STUDIES: Record<string, string> = {
  'building-a-perfect-design-system-from-zero': 'invoice-processing-gl-reconciliation',
  'launching-a-marketing-site-in-5-days': 'rag-knowledge-base',
  'prototyping-an-onboarding-flow-that-actually-converts': 'zero-touch-client-onboarding',
  'redesigning-the-core-dashboard-of-saas-product': 'ai-voice-receptionist'
}

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  redirects: async () =>
    Object.entries(RENAMED_CASE_STUDIES).map(([from, to]) => ({
      source: `/case-study/${from}`,
      destination: `/case-study/${to}`,
      permanent: true
    }))
}

export default nextConfig
