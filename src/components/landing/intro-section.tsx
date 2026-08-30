"use client"

import { useEffect, useRef, useState } from "react"

import { GreetingWord } from "@/components/landing/greeting-word"


const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'

const CONTACT = [
  { label: "Email", value: "ramonvallejerajr@gmail.com", href: "mailto:ramonvallejerajr@gmail.com" },
  { label: "Location", value: "Philippines — working across time zones", href: null },
  { label: "Availability", value: "Open to new projects", href: null },
] as const

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/ramonaljr" },
  { label: "LinkedIn", href: "https://linkedin.com/in/ramon-vallejera-jr-mba" },
  { label: "X", href: "https://x.com/ramonaljr" },
] as const

// Matches the Tag used by the other sections on this page.
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] tracking-widest font-sans text-black/55 bg-black/[0.04]">
      {children}
    </span>
  )
}

function useInView(threshold = 0.15) {
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

export function IntroSection() {
  const { ref, inView } = useInView(0.1)

  const reveal = (delay: number) => ({
    opacity: inView ? 1 : 0,
    filter: inView ? "blur(0px)" : "blur(14px)",
    transform: inView ? "translateY(0px)" : "translateY(20px)",
    transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  return (
    <section id="about" className="py-32 px-6 md:px-12 lg:px-20 border-t border-black/[0.06]">
      <div ref={ref} className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="mb-16" style={reveal(0)}>
          <Tag>ABOUT</Tag>
        </div>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-20 items-start">

          {/* ── Left: the introduction ──────────────────────────────────── */}
          <div>
            <div style={reveal(60)}>
              <h2
                className="text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                <GreetingWord className="text-black/50" />
                <span className="text-black/50">, I&apos;m</span>
                <br />
                Ramon A. Vallejera, Jr.
              </h2>
              <p
                className="mt-4 text-xl sm:text-2xl font-light text-black/62"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                AI Automation Specialist
                <span className="text-black/62"> · MBA</span>
              </p>
            </div>

            <p className="mt-8 text-[15px] leading-relaxed text-black/55 max-w-xl" style={reveal(140)}>
              Finance professional and MBA with 10 years of business operations and analytical
              experience. Based in the Philippines, I build production-grade{" "}
              <span className="text-black/80">n8n workflows</span> (cloud and self-hosted),{" "}
              <span className="text-black/80">Claude and OpenAI agent integrations</span>,{" "}
              <span className="text-black/80">RAG knowledge systems</span>, and{" "}
              <span className="text-black/80">multi-system API pipelines</span> across Google
              Workspace, Airtable and Telegram — engineered with strict error handling, failovers
              and clear documentation, so teams can actually run them.
            </p>

            {/* ── Contact rows ──────────────────────────────────────────── */}
            <div className="mt-10 space-y-3" style={reveal(220)}>
              {CONTACT.map(c => (
                <div key={c.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[11px] tracking-widest text-black/55 font-mono w-24 shrink-0">
                    {c.label.toUpperCase()}
                  </span>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="text-sm text-black/70 hover:text-black transition-colors border-b border-black/10 hover:border-black/40"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-sm text-black/70">{c.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* ── CTA + socials ─────────────────────────────────────────── */}
            <div className="mt-10 flex flex-wrap items-center gap-4" style={reveal(300)}>
              <a
                href="/contact"
                className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#111] text-white text-[13px] tracking-wide hover:bg-black transition-colors"
              >
                HIRE ME
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3 11L11 3M11 3H5M11 3V9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

              <div className="flex items-center gap-2">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-full border border-black/10 text-[11px] tracking-wide text-black/55 hover:text-black hover:border-black/25 hover:bg-black/[0.03] transition-all"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: portrait ──────────────────────────────────────────── */}
          <div style={reveal(180)}>
            <div className="relative">
              {/* Office background lifted out with the Vision framework and
                  composited on white, so the portrait sits on a white card
                  rather than clashing with the cream ground. */}
              <div className="rounded-2xl overflow-hidden bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]">
                <img
                  src="/images/landing/ramon-portrait.webp"
                  alt="Ramon A. Vallejera, Jr."
                  width={1200}
                  height={1500}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Availability chip */}
              <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-black/[0.07] backdrop-blur-sm">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-[pulse-dot_2s_ease-in-out_infinite]" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] tracking-widest text-black/55 font-mono">AVAILABLE</span>
              </div>
            </div>

            {/* Credentials strip */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-black/[0.07] border border-black/[0.07] rounded-xl overflow-hidden bg-white/50">
              {[
                { value: "10", label: "yrs in finance ops" },
                { value: "MBA", label: "business strategy" },
                { value: "n8n", label: "cloud + self-hosted" },
              ].map(s => (
                <div key={s.label} className="px-3 py-4 text-center">
                  <div className="text-lg font-light text-[#111]" style={{ fontFamily: DISPLAY_FONT }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-black/55">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
