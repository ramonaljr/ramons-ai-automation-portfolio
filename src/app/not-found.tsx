import { SiteNav } from '@/components/landing/site-nav'
import { SiteFooter } from '@/components/landing/site-footer'
import { ArrowIcon, ArrowRight, CONTAINER, DISPLAY_FONT, PAGE } from '@/components/landing/motion'

// A dot matrix spelling 404, drawn in the landing page's ink rather than an
// image — it inherits the palette and stays crisp at any size.
const DIGIT_4 = ['....X', '...XX', '..X.X', '.X..X', 'X...X', 'XXXXX', '....X', '....X']
const DIGIT_0 = ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.']

const GRID = DIGIT_4.map((row, i) => `${row}..${DIGIT_0[i]}..${DIGIT_4[i]}`.split(''))

const LINKS = [
  { label: 'Selected work', href: '/#portfolio' },
  { label: 'Articles', href: '/blog' },
  { label: 'Services', href: '/#services' }
]

const NotFound = () => {
  return (
    <div className={PAGE}>
      <SiteNav />

      <section className='px-6 pt-36 pb-32 md:px-12 lg:px-20 lg:pt-44'>
        <div className={CONTAINER}>
          <span className='text-ink-3 inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.25em]'>
            <span className='bg-ink/25 h-px w-8' />
            404
          </span>

          <h1
            className='text-ink mt-7 max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.02] font-light tracking-tight'
            style={{ fontFamily: DISPLAY_FONT }}
          >
            This page took a wrong turn.
          </h1>

          <p className='text-ink-3 mt-7 max-w-xl text-[16px] leading-relaxed'>
            The address does not match anything here. The work, the writing and the contact form are all still where you
            left them.
          </p>

          <div className='mt-12 flex flex-col gap-2' aria-hidden='true'>
            {GRID.map((row, rowIndex) => (
              <div key={rowIndex} className='flex gap-2'>
                {row.map((cell, columnIndex) => (
                  <span
                    key={columnIndex}
                    className={`size-2.5 rounded-[2px] sm:size-3 ${cell === 'X' ? 'bg-ink' : 'bg-ink/6'}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className='mt-14 flex flex-wrap items-center gap-3'>
            <a
              href='/'
              className='group bg-ink text-ground hover:bg-ink/90 inline-flex items-center gap-3 rounded-full py-2 pr-2 pl-6 text-[13px] tracking-wide transition-colors'
            >
              BACK TO THE START
              <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25'>
                <ArrowIcon />
              </span>
            </a>

            {LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className='border-rule text-ink-3 hover:border-rule-strong hover:bg-ink/3 hover:text-ink inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[12px] tracking-wide transition-all'
              >
                {link.label}
                <ArrowRight />
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export default NotFound
