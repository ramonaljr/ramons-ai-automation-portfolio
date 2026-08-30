"use client"

import { MobileNav } from "@/components/landing/mobile-nav"
import { PixelIcon } from "@/components/landing/pixel-icon"

import type { Service } from "@/lib/portfolio"
import { PROFILE } from "@/lib/portfolio"

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto"

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-[3px] shrink-0">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ServiceDetail({ service, others }: { service: Service; others: Service[] }) {
  return (
    <div className="bg-[#F5F4F0] text-[#111] min-h-screen font-sans antialiased">
      <MobileNav />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pt-36 pb-14">
        <div className={CONTAINER}>
          <a
            href="/#services"
            className="inline-flex items-center gap-2 text-[12px] text-black/60 hover:text-black transition-colors mb-10"
          >
            <span aria-hidden="true">←</span> All services
          </a>

          <div className="flex items-start gap-5">
            <span className="hidden sm:flex w-[72px] h-[72px] shrink-0 rounded-full bg-white border border-black/10 items-center justify-center">
              <PixelIcon type="platform" size={30} />
            </span>
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] tracking-widest font-mono text-black/55 bg-black/[0.04]">
                {service.duration.toUpperCase()}
              </span>
              <h1
                className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.05] tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {service.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body + sidebar ───────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pb-32">
        <div className={`${CONTAINER} grid lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-16 items-start`}>

          {/* Main column */}
          <div className="min-w-0">
            <p className="text-[16px] leading-relaxed text-black/60 max-w-2xl">{service.description}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-black/55 max-w-2xl">{service.detail}</p>

            {/* Workflow mockup */}
            <div className="mt-12 rounded-2xl overflow-hidden border border-black/[0.07] bg-white">
              { }
              <img
                src={`/images/services/${service.slug}.svg`}
                alt={`Workflow diagram for ${service.title}`}
                width={1200}
                height={760}
                className="w-full h-auto"
              />
            </div>

            {/* What's included */}
            <h2
              className="mt-16 text-2xl lg:text-3xl font-light tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              What the engagement covers
            </h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {service.includes.map(it => (
                <li key={it} className="flex items-start gap-2.5 text-[14px] leading-snug text-black/60">
                  <span className="text-black/70"><CheckIcon /></span>
                  {it}
                </li>
              ))}
            </ul>

            {/* Deliverables */}
            <h2
              className="mt-16 text-2xl lg:text-3xl font-light tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              What you receive
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {service.deliverables.map(d => (
                <div
                  key={d.title}
                  className="rounded-xl border border-black/[0.07] bg-white/60 p-5 hover:bg-white hover:border-black/12 transition-all duration-300"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-black/70"><CheckIcon /></span>
                    <div>
                      <h3 className="text-[15px] font-medium text-[#111]">{d.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-black/62">{d.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Qualities */}
            <h2
              className="mt-16 text-2xl lg:text-3xl font-light tracking-tight text-[#111]"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              How it is built
            </h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {service.qualities.map(q => (
                <li key={q} className="flex items-start gap-2.5 text-[14px] leading-snug text-black/60">
                  <span className="text-black/70"><CheckIcon /></span>
                  {q}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-16 rounded-2xl border border-black/[0.07] bg-white p-8 sm:p-10">
              <h2
                className="text-2xl font-light tracking-tight text-[#111]"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Think this is what you need?
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-black/55 max-w-lg">
                Tell me the process and the systems involved. I will confirm whether this is the
                right fit and quote a fixed scope.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="/contact"
                  className="group inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-[#111] text-white text-[13px] tracking-wide hover:bg-black transition-colors"
                >
                  REQUEST A QUOTE
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                    <ArrowIcon />
                  </span>
                </a>
                <a
                  href={`mailto:${PROFILE.email}`}
                  className="inline-flex items-center px-5 py-3 rounded-full border border-black/12 text-[12px] tracking-wide text-black/65 hover:text-black hover:border-black/30 hover:bg-black/[0.03] transition-all"
                >
                  {PROFILE.email}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-5">
            {/* Tools */}
            <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-6">
              <h2 className="text-[11px] tracking-widest font-mono text-black/55 pb-3 mb-4 border-b border-black/[0.07]">
                TOOLS USED
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {service.tools.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md border border-black/[0.08] bg-black/[0.02] text-[11px] text-black/55"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Other services */}
            <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-6">
              <h2 className="text-[11px] tracking-widest font-mono text-black/55 pb-3 mb-4 border-b border-black/[0.07]">
                OTHER SERVICES
              </h2>
              <ul className="space-y-2">
                {others.map(o => (
                  <li key={o.slug}>
                    <a
                      href={`/services/${o.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-white px-4 py-3 hover:border-black/20 transition-all"
                    >
                      <span className="text-[13px] text-black/65 group-hover:text-black transition-colors">
                        {o.short}
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#111] text-white shrink-0 transition-transform group-hover:translate-x-0.5">
                        <ArrowIcon />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability */}
            <div className="rounded-2xl border border-black/[0.07] bg-white/60 p-6">
              <div className="flex items-center gap-2">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-[pulse-dot_2s_ease-in-out_infinite]" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] tracking-widest font-mono text-black/62">AVAILABLE</span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-black/55">
                {PROFILE.name} — {PROFILE.title}, {PROFILE.location}.
              </p>
              <a
                href="/#portfolio"
                className="mt-4 inline-flex items-center gap-2 text-[12px] text-black/55 hover:text-black transition-colors"
              >
                See the work
                <ArrowIcon />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
