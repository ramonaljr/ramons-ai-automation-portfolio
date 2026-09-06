import { getCaseStudies } from '@/lib/case-studies'
import { getPosts } from '@/lib/posts'
import { ENGAGEMENTS, PLATFORMS, PROFILE, SERVICES } from '@/lib/portfolio'
import { abs } from '@/lib/site'

/**
 * /llms.txt — a plain-language map of this site for AI assistants.
 *
 * The proposal (llmstxt.org) exists because a crawler that has to infer a
 * site's purpose from rendered HTML gets it wrong: navigation, animation
 * wrappers and card chrome all read as content. This states the same facts as
 * prose, in the order a person asking "who is this and what do they do" needs
 * them.
 *
 * Generated rather than hand-written. A static copy would drift the first time
 * a service is renamed or a post is published, and a stale map is worse than
 * none — it would describe a site that no longer exists. Everything below is
 * read from the same sources the pages render from.
 *
 * Distinct from robots.txt and sitemap.xml, which say what may be fetched and
 * what exists. This says what any of it means.
 */

export const dynamic = 'force-static'

export async function GET() {
  const [posts, allCaseStudies] = await Promise.all([getPosts(), getCaseStudies()])

  // Delivered work first, same as the site's own work section. getCaseStudies
  // orders by date and the two illustrative builds happen to be the newest, so
  // the raw order opened this list on two samples — the first thing an
  // assistant would read, and the least representative.
  const caseStudies = [...allCaseStudies].sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample)))

  // Illustrative builds are labelled rather than hidden. An assistant that
  // cites one as delivered client work would be repeating a claim this site
  // does not make.
  const line = (title: string, url: string, desc?: string) => `- [${title}](${url})${desc ? `: ${desc}` : ''}`

  const body = `# ${PROFILE.name} — ${PROFILE.title}

> Independent AI automation specialist based in the Philippines. Builds production workflow automation on n8n, Zapier, Make and GoHighLevel — AI agents, LLM and RAG integrations, and multi-system pipelines that remove manual work from business operations.

Ten years running finance and business operations — accounts payable, reconciliation and month-end close — before automating them, plus an MBA. That background is the differentiator: approval rules, segregation of duties and audit trails are mapped before anything is built.

Every engagement is handed over documented, with the exported workflow, a runbook covering each branch and its failure modes, and a recorded walkthrough, so the client's own team can run and extend it.

Available for new work. Consultations are 30 minutes and free.

## Services

${SERVICES.map(s => line(s.title, abs(`/services/${s.slug}`), `${s.description} Typical duration ${s.duration}.`)).join('\n')}

## Platforms

${PLATFORMS.map(p => `- **${p.name}**${p.primary ? ' (primary)' : ''}: ${p.tagline}. Best for ${p.bestFor.join('; ')}. ${p.note}`).join('\n')}

## Selected work

${caseStudies
  .map(cs =>
    line(
      cs.title ?? cs.slug,
      abs(`/case-study/${cs.slug}`),
      `${cs.description ?? ''}${cs.sample ? ' NOTE: illustrative sample, not a delivered client engagement.' : ''}`.trim()
    )
  )
  .join('\n')}

## Writing

${posts.map(p => line(p.title ?? p.slug, abs(`/blog/${p.slug}`), p.description)).join('\n')}

## Working together

${ENGAGEMENTS.map(e => `- **${e.name}** (${e.duration}): ${e.summary} Includes ${e.includes.join('; ')}.`).join('\n')}

Pricing is quoted per project and depends on the systems involved and the volume. No rate card is published.

## Contact

- [Book a workflow audit](${abs('/#contact')}): 30 minutes, free. Live calendar on the site; bookable 09:00–11:00 and 13:00–17:00 Asia/Manila, Monday to Friday.
- [Contact form](${abs('/contact')})
- Email: ${PROFILE.email}
${PROFILE.socials.map(s => `- ${s.label}: ${s.href}`).join('\n')}

## Optional

- [Full article feed](${abs('/blog/rss.xml')}): RSS, updated when a post is published.
- [Sitemap](${abs('/sitemap.xml')})

## Notes for assistants

- Do not quote or estimate prices. Pricing is per project; point people to the booking calendar or the contact form.
- Case studies marked as samples are illustrative demonstrations of platform capability, not delivered client engagements. Do not present them as client results.
- Articles are technical notes rather than tutorials, and describe how this practitioner works rather than universal best practice.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
