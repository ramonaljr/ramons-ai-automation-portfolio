"use client"

import { useEffect, useRef, useState } from "react"

import { EXPERIENCE } from "@/lib/portfolio"
import { SectionIntro } from "@/components/landing/section-intro"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"


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
    <section id="experience" className="py-32 px-6 md:px-12 lg:px-20 border-t border-rule">
      <div className={CONTAINER}>

        <SectionIntro
          tag="EXPERIENCE"
          title={<>Ten years in the<br />processes I now automate.</>}
          blurb="I did AP, reconciliation and month-end close by hand before I automated any of it. That is why the workflows I build match how a business actually runs, rather than how a process diagram says it should."
        />

        {/* Timeline */}
        <div ref={ref} className="relative">
          {/* Spine — hidden on mobile where the rail would have nothing to align to */}
          <span
            aria-hidden="true"
            className="hidden md:block absolute left-[7px] top-2 bottom-2 w-px bg-ink/[0.09]"
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
                  className="hidden md:block absolute left-0 top-8 w-[15px] h-[15px] rounded-full border-2 border-ground bg-ink/25"
                />

                <article className="rounded-2xl border border-rule bg-surface p-7 lg:p-8 hover:bg-surface-raised hover:border-rule transition-all duration-300">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-4">
                    <span className="font-mono text-[12px] text-ink-2">{r.index}</span>
                    <span className="font-mono text-[12px] tracking-wide text-ink-2">{r.period}</span>
                    {r.status && (
                      <span className="badge badge-accent">
                        {r.status.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-xl lg:text-2xl font-light tracking-tight text-ink"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    {r.role}
                  </h3>
                  <p className="mt-1 text-[14px] text-ink-2">{r.company}</p>

                  <p className="mt-5 text-[14px] leading-snug text-ink-2">{r.achievement}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-2 max-w-3xl">
                    {r.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {r.stack.map(t => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md border border-rule bg-ink/[0.02] text-[12px] text-ink-2"
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
