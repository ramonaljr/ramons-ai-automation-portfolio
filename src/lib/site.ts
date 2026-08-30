/**
 * Canonical origin for the site.
 *
 * Everything that emits an absolute URL — canonicals, Open Graph, sitemap,
 * robots, JSON-LD — reads from here, so there is one place to change when the
 * custom domain lands.
 *
 * NEXT_PUBLIC_APP_URL should be set in the deployment environment. The
 * fallback is the Vercel project domain rather than localhost, so a missing
 * env var degrades to a wrong-but-real URL instead of one no crawler can reach.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://ramons-ai-automation-portfolio.vercel.app'
).replace(/\/$/, '')

export const abs = (path = '') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
