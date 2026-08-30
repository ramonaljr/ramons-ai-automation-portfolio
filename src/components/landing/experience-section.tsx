"use client"

import { useEffect, useRef, useState } from "react"

import { EXPERIENCE } from "@/lib/portfolio"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] tracking-widest font-sans text-black/68 bg-black/[0.04]">
      {children}
    </span>
  )
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

export function ExperienceSection() {
  const { ref, inView } = useInView(0.06)

  return (
    <section id="experience" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div className={CONTAINER}>

        <div className="mb-16">
          <Tag>EXPERIENCE</Tag>
          <h2
            className="mt-6 text-[clamp(2rem,4vw,3.25rem)] font-light leading-[1.05] tracking-tight text-[#111]"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Ten years in the<br />processes I now automate.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-black/72 max-w-xl">
            I did AP, reconciliation and month-end close by hand before I automated any of it.
            That is why the workflows I build match how finance teams actually operate.
          </p>
        </div>

        {/* Timeline */}
        <div ref={ref} className="relative">
          {/* Spine — hidden on mobile where the rail would have nothing to align to */}
          <span
            aria-hidden="true"
            className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-black/[0.09]"
          />

          <ol className="space-y-4">
            {EXPERIENCE.map((r, i) => (
              <li
                key={r.index}
                className="relative md:pl-12"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0px)" : "translateY(22px)",
                  transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`,
                }}
              >
                {/* Node */}
                <span
                  aria-hidden="true"
                  className="hidden md:block absolute left-0 top-8 w-[15px] h-[15px] rounded-full border-2 border-[#F5F4F0] bg-black/25"
                />

                <article className="rounded-2xl border border-black/[0.07] bg-white/50 p-7 lg:p-8 hover:bg-white hover:border-black/12 transition-all duration-300">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-4">
                    <span className="font-mono text-[12px] text-black/72">{r.index}</span>
                    <span className="font-mono text-[12px] tracking-wide text-black/70">{r.period}</span>
                    {r.status && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-500/[0.07] px-2.5 py-0.5 text-[11px] tracking-widest font-mono text-emerald-700/80">
                        {r.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-xl lg:text-2xl font-light tracking-tight text-[#111]"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {r.role}
                  </h3>
                  <p className="mt-1 text-[14px] text-black/70">{r.company}</p>

                  <p className="mt-5 text-[14px] leading-snug text-black/75">{r.achievement}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-black/72 max-w-3xl">
                    {r.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {r.stack.map(t => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md border border-black/[0.08] bg-black/[0.02] text-[12px] text-black/72"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
