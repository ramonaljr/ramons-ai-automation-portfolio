import type { JSX } from 'react'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'

import { DISPLAY_FONT } from '@/components/landing/motion'
import { generateSlug } from '@/lib/extract-headings'

/**
 * Long-form prose in the landing page's voice: IBM Plex light for headings,
 * ink-on-cream body copy, hairline rules instead of boxes.
 *
 * The measure is set once by the caller's container rather than per element —
 * that keeps text, images and pull quotes on the same left edge.
 *
 * Heading ids come from the same `generateSlug` the table of contents uses, so
 * the two can never drift apart.
 */

const HEAD = 'scroll-mt-28 font-light tracking-tight text-[#111]'

const components: MDXRemoteProps['components'] = {
  // h1 belongs to the page header; inside the body it reads as a section break.
  h1: ({ children }) => (
    <h1 id={generateSlug(children as string)} className={`${HEAD} mt-16 text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight`} style={{ fontFamily: DISPLAY_FONT }}>
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2
      id={generateSlug(children as string)}
      className={`${HEAD} mt-16 border-t border-black/[0.07] pt-10 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight first:mt-0 first:border-t-0 first:pt-0`}
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 id={generateSlug(children as string)} className={`${HEAD} mt-12 text-[20px] leading-snug`} style={{ fontFamily: DISPLAY_FONT }}>
      {children}
    </h3>
  ),

  h4: ({ children }) => (
    <h4 id={generateSlug(children as string)} className='mt-9 scroll-mt-28 font-mono text-[13px] font-semibold tracking-[0.18em] text-[#111]'>
      {children}
    </h4>
  ),

  p: ({ children }) => <p className='mt-5 text-[15.5px] leading-[1.8] text-black/70'>{children}</p>,

  ul: ({ children }) => <ul className='mt-6 space-y-3'>{children}</ul>,

  // `li` renders a dot bullet by default. Inside an ordered list the marker
  // carries the ordinal instead, so the list itself suppresses the dot and
  // undoes the flex row rather than the item needing to know its parent.
  ol: ({ children }) => (
    <ol className='mt-6 list-decimal space-y-3 pl-5 marker:font-mono marker:text-[13px] marker:text-black/40 [&>li]:block [&>li>span:first-child]:hidden'>
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className='flex items-start gap-3 text-[15px] leading-[1.7] text-black/70'>
      <span className='mt-[9px] h-1 w-1 shrink-0 rounded-full bg-black/30' aria-hidden='true' />
      <span>{children}</span>
    </li>
  ),

  hr: () => <hr className='mt-12 border-black/[0.07]' />,

  a: ({ href, children }) => (
    <a
      href={href as string}
      className='text-[#111] underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black'
    >
      {children}
    </a>
  ),

  strong: ({ children }) => <strong className='font-medium text-[#111]'>{children}</strong>,

  code: ({ children }) => (
    <code className='rounded border border-black/[0.08] bg-black/[0.03] px-1.5 py-0.5 font-mono text-[13px] text-[#111]'>
      {children}
    </code>
  ),

  pre: ({ children }) => (
    <pre className='mt-6 overflow-x-auto rounded-xl border border-black/[0.07] bg-white/70 p-5 font-mono text-[13px] leading-relaxed text-black/75 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0'>
      {children}
    </pre>
  ),

  img: ({ src, alt }) => (
    <figure className='mt-10'>
      <div className='rounded-2xl border border-black/[0.07] bg-white p-2'>
        <img src={src as string} alt={(alt as string) ?? ''} className='w-full rounded-xl' />
      </div>
      {alt ? <figcaption className='mt-3 font-mono text-[11px] tracking-wide text-black/45'>{alt}</figcaption> : null}
    </figure>
  ),

  blockquote: ({ children }) => (
    <blockquote className='mt-10 border-l border-black/20 pl-6 text-[17px] leading-relaxed font-light text-black/62 italic [&_p]:mt-0 [&_p]:text-[17px] [&_p]:leading-relaxed [&_p]:text-black/62'>
      {children}
    </blockquote>
  )
}

const MDXContent = (props: JSX.IntrinsicAttributes & MDXRemoteProps) => {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}

export default MDXContent
