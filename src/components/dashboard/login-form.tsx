'use client'

import { useEffect, useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import { DashboardMark } from '@/components/dashboard/mark'
import { getSupabase, supabaseConfigured } from '@/lib/supabase'

/**
 * Email and password sign-in for the dashboard. There is no sign-up form:
 * the one account is created in Supabase, and sign-ups are switched off there
 * (see supabase/dashboard.sql).
 */
export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in: go straight through.
  useEffect(() => {
    const supabase = getSupabase()

    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

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

    router.replace('/dashboard')
  }

  return (
    <main className='rvd-wrap rvd-login'>
      <div className='rvd-login-card'>
        <a className='rvd-brand' href='/'>
          <DashboardMark />
          <div>
            <b>Ramon Vallejera Jr.</b>
            <span>Client dashboard</span>
          </div>
        </a>
        <h1>Sign in</h1>

        {supabaseConfigured ? (
          <form onSubmit={onSubmit}>
            <label htmlFor='login-email'>
              Email
              <input
                id='login-email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label htmlFor='login-password'>
              Password
              <input
                id='login-password'
                type='password'
                autoComplete='current-password'
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p className='rvd-alert' role='alert'>
                {error}
              </p>
            )}
            <button className='rvd-btn primary' type='submit' disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <p className='rvd-alert info'>
            The dashboard isn’t connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel,
            then redeploy.
          </p>
        )}

        <a className='rvd-mono' href='/' style={{ color: 'var(--ink-3)' }}>
          ← Back to ramonvallejera.com
        </a>
      </div>
    </main>
  )
}
