'use client'

import { SiteNav } from '@/components/landing/site-nav'
import { PixelIcon } from '@/components/landing/pixel-icon'

import type { Service } from '@/lib/portfolio'
import { PROFILE } from '@/lib/portfolio'

const DISPLAY_FONT = 'var(--font-ibm-plex), "IBM Plex Sans", sans-serif'
const CONTAINER = 'max-w-[1400px] 2xl:max-w-[1600px] mx-auto'

function ArrowIcon() {
  return (
    <svg width='13' height='13' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
      <path
        d='M3 11L11 3M11 3H5M11 3V9'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true' className='mt-[3px] shrink-0'>
      <path
        d='M2.5 7.5L5.5 10.5L11.5 3.5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function ServiceDetail({ service, others }: { service: Service; others: Service[] }) {
  return (
    <div className='bg-ground text-ink min-h-screen font-sans antialiased'>
      <SiteNav />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className='px-6 pt-36 pb-14 md:px-12 lg:px-20'>
        <div className={CONTAINER}>
          <a
            href='/#services'
            className='text-ink-2 hover:text-ink mb-10 inline-flex items-center gap-2 text-[13px] transition-colors'
          >
            <span aria-hidden='true'>←</span> All services
          </a>

          <div className='flex items-start gap-5'>
            <span className='bg-surface-raised border-rule hidden h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border sm:flex'>
              <PixelIcon type='platform' size={30} />
            </span>
            <div>
              <span className='text-ink-2 bg-ink/4 inline-flex items-center rounded-full px-3 py-1 font-mono text-[12px] tracking-widest'>
                {service.duration.toUpperCase()}
              </span>
              <h1
                className='text-ink mt-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-light tracking-tight'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {service.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body + sidebar ───────────────────────────────────────────────── */}
      <section className='px-6 pb-32 md:px-12 lg:px-20'>
        <div className={`${CONTAINER} grid items-start gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-16`}>
          {/* Main column */}
          <div className='min-w-0'>
            <p className='text-ink-2 max-w-2xl text-[16px] leading-relaxed'>{service.description}</p>
            <p className='text-ink-2 mt-5 max-w-2xl text-[15px] leading-relaxed'>{service.detail}</p>

            {/* Workflow mockup */}
            <div className='border-rule bg-surface-raised mt-12 overflow-hidden rounded-2xl border'>
              {}
              <img
                src={`/images/services/${service.slug}.svg`}
                alt={`Workflow diagram for ${service.title}`}
                width={1200}
                height={760}
                className='h-auto w-full'
              />
            </div>

            {/* What's included */}
            <h2
              className='text-ink mt-16 text-2xl font-light tracking-tight lg:text-3xl'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              What the engagement covers
            </h2>
            <ul className='mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2'>
              {service.includes.map(it => (
                <li key={it} className='text-ink-2 flex items-start gap-2.5 text-[14px] leading-snug'>
                  <span className='text-ink-2'>
                    <CheckIcon />
                  </span>
                  {it}
                </li>
              ))}
            </ul>

            {/* Deliverables */}
            <h2
              className='text-ink mt-16 text-2xl font-light tracking-tight lg:text-3xl'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              What you receive
            </h2>
            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              {service.deliverables.map(d => (
                <div
                  key={d.title}
                  className='border-rule bg-surface hover:bg-surface-raised hover:border-rule rounded-xl border p-5 transition-all duration-300'
                >
                  <div className='flex items-start gap-2.5'>
                    <span className='text-ink-2'>
                      <CheckIcon />
                    </span>
                    <div>
                      <h3 className='text-ink text-[15px] font-medium'>{d.title}</h3>
                      <p className='text-ink-2 mt-1.5 text-[14px] leading-relaxed'>{d.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Qualities */}
            <h2
              className='text-ink mt-16 text-2xl font-light tracking-tight lg:text-3xl'
              style={{ fontFamily: DISPLAY_FONT }}
            >
              How it is built
            </h2>
            <ul className='mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2'>
              {service.qualities.map(q => (
                <li key={q} className='text-ink-2 flex items-start gap-2.5 text-[14px] leading-snug'>
                  <span className='text-ink-2'>
                    <CheckIcon />
                  </span>
                  {q}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className='border-rule bg-surface-raised mt-16 rounded-2xl border p-8 sm:p-10'>
              <h2 className='text-ink text-2xl font-light tracking-tight' style={{ fontFamily: DISPLAY_FONT }}>
                Think this is what you need?
              </h2>
              <p className='text-ink-2 mt-3 max-w-lg text-[14px] leading-relaxed'>
                Tell me the process and the systems involved. I will confirm whether this is the right fit and quote a
                fixed scope.
              </p>
              <div className='mt-7 flex flex-wrap items-center gap-3'>
                <a
                  href='/contact'
                  className='group bg-ink text-ground hover:bg-ink/90 inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-[14px] tracking-wide transition-colors'
                >
                  Request a quote
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
                    <ArrowIcon />
                  </span>
                </a>
                <a
                  href={`mailto:${PROFILE.email}`}
                  className='border-rule text-ink-2 hover:text-ink hover:border-rule-strong hover:bg-ink/3 inline-flex items-center rounded-full border px-5 py-3 text-[13px] tracking-wide transition-all'
                >
                  {PROFILE.email}
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className='space-y-5 lg:sticky lg:top-28'>
            {/* Tools */}
            <div className='border-rule bg-surface rounded-2xl border p-6'>
              <h2 className='text-ink-2 border-rule mb-4 border-b pb-3 font-mono text-[12px] tracking-widest'>
                TOOLS USED
              </h2>
              <div className='flex flex-wrap gap-1.5'>
                {service.tools.map(t => (
                  <span key={t} className='border-rule bg-ink/2 text-ink-2 rounded-md border px-2.5 py-1 text-[12px]'>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Other services */}
            <div className='border-rule bg-surface rounded-2xl border p-6'>
              <h2 className='text-ink-2 border-rule mb-4 border-b pb-3 font-mono text-[12px] tracking-widest'>
                OTHER SERVICES
              </h2>
              <ul className='space-y-2'>
                {others.map(o => (
                  <li key={o.slug}>
                    <a
                      href={`/services/${o.slug}`}
                      className='group border-rule bg-surface-raised hover:border-rule-strong flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all'
                    >
                      <span className='text-ink-2 group-hover:text-ink text-[14px] transition-colors'>{o.short}</span>
                      <span className='bg-ink text-ground flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5'>
                        <ArrowIcon />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Availability */}
            <div className='border-rule bg-surface rounded-2xl border p-6'>
              <div className='flex items-center gap-2'>
                <span className='relative flex h-1.5 w-1.5'>
                  <span className='absolute -inset-1 animate-[pulse-dot_2s_ease-in-out_infinite] rounded-full bg-emerald-500/30' />
                  <span className='relative h-1.5 w-1.5 rounded-full bg-emerald-500' />
                </span>
                <span className='text-ink-2 font-mono text-[12px] tracking-widest'>AVAILABLE</span>
              </div>
              <p className='text-ink-2 mt-3 text-[14px] leading-relaxed'>
                {PROFILE.name} — {PROFILE.title}, {PROFILE.location}.
              </p>
              <a
                href='/#portfolio'
                className='text-ink-2 hover:text-ink mt-4 inline-flex items-center gap-2 text-[13px] transition-colors'
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
