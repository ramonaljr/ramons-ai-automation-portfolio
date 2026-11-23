'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from 'react'

import { getSupabase, supabaseConfigured } from '@/lib/supabase'

// The dashboard is a standalone page (public/dashboard/index.html), not a Next
// route, so getting there is a full page load rather than router navigation.
const openDashboard = () => window.location.replace('/dashboard')

// Today's date as YYYY-MM-DD in the visitor's time zone. Read through
// useSyncExternalStore so the server render (which can't know the visitor's
// date) and the browser agree: the server sends an empty value, then the
// browser fills it in without a hydration mismatch.
const noSubscribe = () => () => {}

const todayKey = () => {
  const d = new Date()

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const noDate = () => ''

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The seven days of the week containing `key`, Sunday first, as the desk's welcome screen draws them. */
function weekOf(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  const today = new Date(y, m - 1, d)
  const sunday = new Date(y, m - 1, d - today.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i)

    return { dow: DOW[day.getDay()], date: day.getDate(), today: i === today.getDay() }
  })
}

/**
 * Email and password sign-in for the dashboard, dressed as the desk's welcome
 * screen: the same card, film and week strip. Signed out there is no client
 * data to show (it only opens after sign-in), so the sign-in fields take the
 * place of the desk's "Active clients" and "Next up" rows.
 *
 * There is no sign-up form: the one account is created in Supabase, and
 * sign-ups are switched off there (see supabase/dashboard.sql).
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const film = useRef<HTMLVideoElement>(null)

  const key = useSyncExternalStore(noSubscribe, todayKey, noDate)

  const todayLabel = key
    ? new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''

  // Already signed in: go straight through.
  useEffect(() => {
    const supabase = getSupabase()

    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) openDashboard()
    })
  }, [])

  // The film plays unless the visitor asked for less motion; the poster stays otherwise.
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) film.current?.play().catch(() => {})
  }, [])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const supabase = getSupabase()

    if (!supabase) return

    setBusy(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (signInError) {
      setBusy(false)
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'That email and password don’t match. Check both and try again.'
          : `Couldn’t sign in: ${signInError.message}`
      )

      return
    }

    openDashboard()
  }

  return (
    <main className='rvd-gate'>
      <div className='rvd-gcard'>
        <div className='rvd-gleft'>
          <span className='rvd-gpill rvd-rise' style={{ '--i': 0 } as CSSProperties}>
            Ramon Vallejera
          </span>

          <div className='rvd-gmid'>
            <h1 className='rvd-rise' style={{ '--i': 1 } as CSSProperties}>
              Welcome back, Ramon
            </h1>
            <p className='rvd-glead rvd-rise' style={{ '--i': 2 } as CSSProperties}>
              Your client desk: playbook, timeline and guides in one place.
            </p>

            <div className='rvd-gfield rvd-rise' style={{ '--i': 3 } as CSSProperties}>
              <span>Today</span>
              <output>{todayLabel}</output>
            </div>

            {supabaseConfigured ? (
              <form onSubmit={onSubmit}>
                <label className='rvd-gfield rvd-rise' style={{ '--i': 4 } as CSSProperties}>
                  <span>Email</span>
                  <input
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </label>
                <label className='rvd-gfield rvd-rise' style={{ '--i': 5 } as CSSProperties}>
                  <span>Password</span>
                  <input
                    type='password'
                    autoComplete='current-password'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </label>
                {error && (
                  <p className='rvd-galert' role='alert'>
                    {error}
                  </p>
                )}
                <button
                  className='rvd-gbtn rvd-rise'
                  style={{ '--i': 6 } as CSSProperties}
                  type='submit'
                  disabled={busy}
                >
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <p className='rvd-galert'>
                The dashboard isn’t connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
                Vercel, then redeploy.
              </p>
            )}
          </div>

          <div className='rvd-gfoot rvd-rise' style={{ '--i': 7 } as CSSProperties}>
            <span>Private client desk</span>
            <a href='/'>ramonvallejera.com</a>
          </div>
        </div>

        <div className='rvd-gright' aria-hidden='true'>
          {}
          <img className='rvd-gposter' src='/dashboard/media/blossom-poster.jpg' alt='' />
          <video
            ref={film}
            className='rvd-gposter'
            muted
            loop
            playsInline
            preload='auto'
            poster='/dashboard/media/blossom-poster.jpg'
          >
            <source src='/dashboard/media/blossom.mp4' type='video/mp4' />
          </video>

          <div className='rvd-gx'>
            <a href='/' aria-label='Back to ramonvallejera.com' tabIndex={-1}>
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M6 6l12 12M18 6 6 18' />
              </svg>
            </a>
          </div>

          {key && (
            <div className='rvd-gweek'>
              {weekOf(key).map(day => (
                <div key={day.dow} className={day.today ? 'on' : undefined}>
                  <span>{day.dow}</span>
                  <b>{day.date}</b>
                </div>
              ))}
              <div className='rvd-ghatch' />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
