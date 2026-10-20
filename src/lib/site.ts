/**
 * Canonical origin for the site.
 *
 * Everything that emits an absolute URL — canonicals, Open Graph, sitemap,
 * robots, JSON-LD — reads from here, so there is one place to change when the
 * custom domain lands.
 *
 * NEXT_PUBLIC_APP_URL can override this per environment (a preview deploy, a
 * staging domain). The fallback is the production domain rather than localhost,
 * so a missing env var still emits the real canonical URL instead of one no
 * crawler can reach.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://ramonvallejera.com').replace(/\/$/, '')

export const abs = (path = '') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
