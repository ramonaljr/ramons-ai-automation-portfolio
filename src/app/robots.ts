import type { MetadataRoute } from 'next'

import { abs, SITE_URL } from '@/lib/site'

/**
 * AI crawlers, named explicitly.
 *
 * `User-agent: *` already permits all of these, so listing them changes no
 * behaviour on its own. It is here to make the position deliberate and
 * greppable: a future decision to exclude one is a two-line edit against a
 * named agent, rather than a rewrite of a wildcard nobody wants to touch.
 *
 * The position: allow everything. There is a real argument for blocking the
 * training crawlers — they take the writing and return no attribution — but
 * this is a portfolio whose entire job is to be found by someone looking to
 * hire. For that, being absent from the systems buyers increasingly ask first
 * costs more than uncompensated training does. Obscurity is the bigger risk.
 *
 * Three distinct kinds are grouped below, because they warrant different
 * answers if that ever changes:
 *
 *   Retrieval    fetch a page because a user asked something right now, and
 *                cite it back with a link. Pure upside; block these last.
 *   Indexing     build the search corpus those answers are drawn from.
 *                Blocking one removes you from its answers entirely.
 *   Training     collect text for model training. No citation, no referral.
 *                The only group with a genuine argument for exclusion.
 */
const RETRIEVAL = ['ChatGPT-User', 'OAI-SearchBot', 'Claude-User', 'Claude-SearchBot', 'Perplexity-User']
const INDEXING = ['PerplexityBot', 'Applebot', 'Amazonbot', 'DuckAssistBot']
const TRAINING = ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'CCBot', 'Bytespider', 'meta-externalagent']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: RETRIEVAL, allow: '/' },
      { userAgent: INDEXING, allow: '/' },
      { userAgent: TRAINING, allow: '/' }
    ],

    // Both maps, deliberately. sitemap.xml lists what exists; llms.txt says
    // what it means. A crawler that reads only one still gets something.
    sitemap: [`${SITE_URL}/sitemap.xml`, abs('/llms.txt')],
    host: SITE_URL
  }
}
