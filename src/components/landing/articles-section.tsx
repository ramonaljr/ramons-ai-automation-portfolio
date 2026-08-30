"use client"

import { useEffect, useRef, useState } from "react"

import type { PostMetadata } from "@/lib/posts"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"

function Ico({ d, size = 13 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const P = {
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  arrow: "M4 12h14M13 6l6 6-6 6",
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current

    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })

    obs.observe(el)

    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

const formatDate = (v?: string) => {
  if (!v) return null
  const d = new Date(v)

  if (Number.isNaN(d.getTime())) return null

  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

export function ArticlesSection({ posts }: { posts: PostMetadata[] }) {
  const { ref, inView } = useInView(0.06)

  // Nothing to show yet — render nothing rather than an empty shelf.
  if (!posts.length) return null

  return (
    <section id="articles" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className={CONTAINER}>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-14">
          <div>
            <p className="font-mono text-[13px] tracking-[0.28em] text-black/62">WRITING</p>
            <h2
              className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Check out my articles
            </h2>
          </div>

          <a
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/12 px-5 py-2.5 text-[13px] tracking-wide text-black/72 transition-all hover:border-black/30 hover:bg-black/[0.03] hover:text-black"
          >
            All articles
            <Ico d={P.arrow} />
          </a>
        </div>

        <div ref={ref} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <article
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white/50 transition-all duration-300 hover:border-black/12 hover:bg-white"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, border-color .3s, background-color .3s`,
              }}
            >
              <a href={`/blog/${post.slug}`} className="block border-b border-black/[0.07] bg-white">
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt=""
                    aria-hidden="true"
                    width={1200}
                    height={750}
                    loading="lazy"
                    className="h-[190px] w-full object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                )}
              </a>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-black/68">
                  <span className="inline-flex items-center gap-1.5">
                    <Ico d={P.user} size={12} />
                    Ramon
                  </span>
                  {post.readingTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Ico d={P.clock} size={12} />
                      {post.readingTime}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  {post.category && (
                    <span className="rounded-full border border-black/12 px-3.5 py-1.5 font-mono text-[12px] text-black/70">
                      {post.category}
                    </span>
                  )}
                  {formatDate(post.publishedAt) && (
                    <span className="font-mono text-[12px] text-black/62">
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                </div>

                <h3
                  className="mt-5 text-[20px] font-light leading-snug tracking-tight text-[#111]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  <a href={`/blog/${post.slug}`} className="transition-colors hover:text-black">
                    {post.title}
                  </a>
                </h3>

                {post.description && (
                  <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-black/72">
                    {post.description}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 font-mono text-[13px] tracking-wide text-black/72 transition-colors hover:text-black"
                  >
                    READ ARTICLE
                    <Ico d={P.arrow} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
