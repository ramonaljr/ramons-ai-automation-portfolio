import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import './dashboard.css'

/**
 * The private side of the site: /login and the client dashboard behind it.
 *
 * Kept out of search on three levels: noindex here, a Disallow in robots.ts,
 * and no entry in the sitemap. None of that is security — the data is
 * protected by Supabase row-level security — it just keeps a login form out
 * of search results for a portfolio site.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true }
}

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className='rvd flex w-full flex-col'>{children}</div>
)

export default DashboardLayout
