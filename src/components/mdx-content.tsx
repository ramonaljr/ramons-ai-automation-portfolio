import { Children, isValidElement, type JSX, type ReactNode } from 'react'

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

const HEAD = 'scroll-mt-28 font-light tracking-tight text-ink'

/** Images carry their alt text as a visible caption. */
const MdxImage = ({ src, alt }: { src?: string; alt?: string }) => (
  <figure className='mt-10'>
    <div className='border-rule bg-surface-raised rounded-2xl border p-2'>
      <img src={src} alt={alt ?? ''} className='w-full rounded-xl' />
    </div>
    {alt ? (
      <figcaption className='text-ink-3 mt-3 font-mono text-[11px] leading-relaxed tracking-wide'>{alt}</figcaption>
    ) : null}
  </figure>
)

/**
 * Markdown wraps a standalone image in a paragraph. `<figure>` is not valid
 * inside `<p>`, so the browser reparents it and hydration fails — the paragraph
 * has to step aside when it holds nothing but an image.
 */
const isLoneImage = (children: ReactNode) => {
  const nodes = Children.toArray(children)

  return nodes.length === 1 && isValidElement(nodes[0]) && nodes[0].type === MdxImage
}

const components: MDXRemoteProps['components'] = {
  // h1 belongs to the page header; inside the body it reads as a section break.
  h1: ({ children }) => (
    <h1
      id={generateSlug(children as string)}
      className={`${HEAD} mt-16 text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight`}
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2
      id={generateSlug(children as string)}
      className={`${HEAD} border-rule mt-16 border-t pt-10 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight first:mt-0 first:border-t-0 first:pt-0`}
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3
      id={generateSlug(children as string)}
      className={`${HEAD} mt-12 text-[20px] leading-snug`}
      style={{ fontFamily: DISPLAY_FONT }}
    >
      {children}
    </h3>
  ),

  h4: ({ children }) => (
    <h4
      id={generateSlug(children as string)}
      className='text-ink mt-9 scroll-mt-28 font-mono text-[13px] font-semibold tracking-[0.18em]'
    >
      {children}
    </h4>
  ),

  p: ({ children }) =>
    isLoneImage(children) ? <>{children}</> : <p className='text-ink-2 mt-5 text-[15.5px] leading-[1.8]'>{children}</p>,

  ul: ({ children }) => <ul className='mt-6 space-y-3'>{children}</ul>,

  // `li` renders a dot bullet by default. Inside an ordered list the marker
  // carries the ordinal instead, so the list itself suppresses the dot and
  // undoes the flex row rather than the item needing to know its parent.
  ol: ({ children }) => (
    <ol className='marker:text-ink-4 mt-6 list-decimal space-y-3 pl-5 marker:font-mono marker:text-[13px] [&>li]:block [&>li>span:first-child]:hidden'>
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className='text-ink-2 flex items-start gap-3 text-[15px] leading-[1.7]'>
      <span className='bg-ink/30 mt-[9px] h-1 w-1 shrink-0 rounded-full' aria-hidden='true' />
      <span>{children}</span>
    </li>
  ),

  hr: () => <hr className='border-rule mt-12' />,

  a: ({ href, children }) => (
    <a
      href={href as string}
      className='text-ink decoration-ink/25 hover:decoration-ink underline underline-offset-4 transition-colors'
    >
      {children}
    </a>
  ),

  strong: ({ children }) => <strong className='text-ink font-medium'>{children}</strong>,

  code: ({ children }) => (
    <code className='border-rule bg-ink/3 text-ink rounded border px-1.5 py-0.5 font-mono text-[13px]'>{children}</code>
  ),

  pre: ({ children }) => (
    <pre className='border-rule bg-surface text-ink-2 mt-6 overflow-x-auto rounded-xl border p-5 font-mono text-[13px] leading-relaxed [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0'>
      {children}
    </pre>
  ),

  img: MdxImage,

  blockquote: ({ children }) => (
    <blockquote className='border-rule-strong text-ink-3 [&_p]:text-ink-3 mt-10 border-l pl-6 text-[17px] leading-relaxed font-light italic [&_p]:mt-0 [&_p]:text-[17px] [&_p]:leading-relaxed'>
      {children}
    </blockquote>
  )
}

const MDXContent = (props: JSX.IntrinsicAttributes & MDXRemoteProps) => {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
}

export default MDXContent
