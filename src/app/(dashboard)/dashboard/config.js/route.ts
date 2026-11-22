/**
 * Supabase settings for the standalone dashboard page (public/dashboard/index.html).
 *
 * That page is plain HTML, so it can't read NEXT_PUBLIC_* variables at build
 * time; it loads this script first instead. Both values are public by design:
 * the anon key only grants what the row-level security in supabase/dashboard.sql
 * allows, which is nothing without a signed-in session.
 */
export const dynamic = 'force-static'

export function GET() {
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  }

  return new Response(`window.RV_SUPABASE=${JSON.stringify(config)};`, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'X-Robots-Tag': 'noindex'
    }
  })
}
