import { getPosts } from '@/lib/posts'
import { PROFILE } from '@/lib/portfolio'
import { abs, SITE_URL } from '@/lib/site'
import { postUrl } from '@/lib/seo'

/**
 * RSS 2.0 feed for the writing section.
 *
 * Worth having beyond the obvious readers: feed URLs are how aggregators,
 * newsletter tools and several search crawlers discover new posts without
 * waiting for a recrawl of the index. The blog pages advertise it through
 * `alternates.types`, so a browser or reader finds it without being told.
 */

export const dynamic = 'force-static'

/** `&` must be escaped first or it would double-escape the entities below. */
const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const posts = await getPosts()

  const items = posts
    .map(post => {
      const url = postUrl(post.slug)
      const date = post.publishedAt ? new Date(post.publishedAt).toUTCString() : undefined

      return [
        '    <item>',
        `      <title>${escapeXml(post.title ?? post.slug)}</title>`,
        `      <link>${url}</link>`,

        // isPermaLink makes the guid resolvable, so a reader that dedupes on
        // guid and one that dedupes on link agree.
        `      <guid isPermaLink="true">${url}</guid>`,
        post.description ? `      <description>${escapeXml(post.description)}</description>` : '',
        date ? `      <pubDate>${date}</pubDate>` : '',
        post.category ? `      <category>${escapeXml(post.category)}</category>` : '',
        `      <dc:creator>${escapeXml(PROFILE.name)}</dc:creator>`,
        '    </item>'
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const latest = posts[0]?.publishedAt

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${PROFILE.name} — Notes on automation`)}</title>
    <link>${abs('/blog')}</link>
    <description>Working notes on n8n, Zapier and Make — architecture decisions, failure modes, and what holds up in production.</description>
    <language>en-us</language>
    <managingEditor>${PROFILE.email} (${escapeXml(PROFILE.name)})</managingEditor>
    <webMaster>${PROFILE.email} (${escapeXml(PROFILE.name)})</webMaster>
    <atom:link href="${abs('/blog/rss.xml')}" rel="self" type="application/rss+xml" />
${latest ? `    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : ''}
    <generator>${SITE_URL}</generator>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}
