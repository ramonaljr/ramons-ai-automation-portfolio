'use client'

import dynamic from 'next/dynamic'

/**
 * The site nav and footer, loaded only when rendered.
 *
 * For the 404 page. The root layout carries its not-found tree on every
 * route, so whatever the 404 imports directly is downloaded on every page,
 * including the homepage, where Turbopack shipped the nav's motion chunk a
 * second time (160 KB, about 53 KB compressed). Behind `dynamic` the 404 adds
 * only this small module; the nav and footer still render on the server, and
 * their code loads when a 404 is actually shown.
 */
export const LazySiteNav = dynamic(() => import('@/components/landing/site-nav').then(m => m.SiteNav))

export const LazySiteFooter = dynamic(() => import('@/components/landing/site-footer').then(m => m.SiteFooter))
