import { ToolMark } from '@/components/landing/tool-stack-section'
import { financeYears, PLATFORMS, PROFILE } from '@/lib/portfolio'

/**
 * The first thing a visitor meets after the promise: who is behind it and
 * what it runs on, before the story asks for five screens of attention.
 *
 * It repeats the About figures on purpose and adds no new claims. The hero
 * keeps its rule of no stats row; this is a band of its own beneath it.
 * Client quotes go in TestimonialsSection once they are approved, not here.
 */
export function ProofStrip({ systemCount }: { systemCount: number }) {
  const facts = [
    { value: `${financeYears()}+ years`, label: 'running finance and accounting work' },
    { value: PROFILE.credential, label: 'in business strategy' },
    { value: String(systemCount), label: 'automation systems built' }
  ]

  return (
    <section aria-label='At a glance' className='proof-strip'>
      <div className='proof-strip-inner mx-auto max-w-390 px-6 md:px-12 lg:px-20 2xl:max-w-440'>
        <dl className='proof-strip-facts'>
          {facts.map(fact => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className='proof-strip-platforms'>
          <p>Builds on</p>
          <ul>
            {PLATFORMS.map(platform => (
              <li key={platform.name}>
                <ToolMark tool={platform} size={18} />
                {platform.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
