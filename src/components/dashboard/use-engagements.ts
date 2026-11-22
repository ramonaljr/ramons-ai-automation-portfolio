'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Engagement } from '@/lib/playbook'

export type SaveStatus = { text: string; error?: boolean }

type Patch = Partial<Pick<Engagement, 'checks' | 'opps' | 'roi'>>

const COLUMNS = 'id, client, project, checks, opps, roi, created_at'

/**
 * The signed-in user's client engagements, kept in local state and written
 * back to Supabase.
 *
 * Edits apply locally at once and are saved after a short pause, one request
 * in flight per client, so ticking ten boxes quickly sends one or two writes
 * rather than ten. Row-level security scopes every query to the owner, so no
 * filter on `owner` is needed here.
 */
export function useEngagements(supabase: SupabaseClient | null, enabled: boolean) {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<SaveStatus>({ text: 'Loading clients…' })

  const latest = useRef<Engagement[]>([])
  const pending = useRef<Record<string, Patch>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const inflight = useRef<Record<string, boolean>>({})

  const commit = useCallback((next: Engagement[]) => {
    latest.current = next
    setEngagements(next)
  }, [])

  useEffect(() => {
    if (!supabase || !enabled) return
    let cancelled = false

    supabase
      .from('engagements')
      .select(COLUMNS)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return

        if (error) {
          setStatus({ text: 'Couldn’t load clients. Refresh to try again.', error: true })
        } else {
          commit((data ?? []) as Engagement[])
          setStatus({ text: data?.length ? 'All changes saved' : 'No clients yet' })
        }

        setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [supabase, enabled, commit])

  /** Send what is waiting for one client; anything edited mid-request goes in the next loop. */
  const flush = useCallback(
    async (id: string) => {
      if (!supabase || inflight.current[id]) return
      inflight.current[id] = true

      while (pending.current[id]) {
        const fields = pending.current[id]

        delete pending.current[id]
        setStatus({ text: 'Saving…' })

        const { error } = await supabase.from('engagements').update(fields).eq('id', id)

        setStatus(
          error ? { text: 'Couldn’t save. Check your connection.', error: true } : { text: 'All changes saved' }
        )
      }

      inflight.current[id] = false
    },
    [supabase]
  )

  /** Apply a change to one client now, and save it shortly. */
  const update = useCallback(
    (id: string, patch: Patch) => {
      commit(latest.current.map(e => (e.id === id ? { ...e, ...patch } : e)))
      pending.current[id] = { ...pending.current[id], ...patch }
      clearTimeout(timers.current[id])
      timers.current[id] = setTimeout(() => void flush(id), 450)
    },
    [commit, flush]
  )

  const create = useCallback(
    async (client: string, project: string) => {
      if (!supabase) return null
      setStatus({ text: 'Saving…' })

      const { data, error } = await supabase.from('engagements').insert({ client, project }).select(COLUMNS).single()

      if (error || !data) {
        setStatus({ text: 'Couldn’t add the client.', error: true })

        return null
      }

      commit([...latest.current, data as Engagement])
      setStatus({ text: 'All changes saved' })

      return (data as Engagement).id
    },
    [supabase, commit]
  )

  const remove = useCallback(
    async (id: string) => {
      if (!supabase) return
      clearTimeout(timers.current[id])
      delete pending.current[id]
      commit(latest.current.filter(e => e.id !== id))

      const { error } = await supabase.from('engagements').delete().eq('id', id)

      setStatus(error ? { text: 'Couldn’t delete. Refresh and try again.', error: true } : { text: 'Deleted' })
    },
    [supabase, commit]
  )

  // Save anything still waiting before the tab closes.
  useEffect(() => {
    const onHide = () => {
      Object.keys(pending.current).forEach(id => {
        clearTimeout(timers.current[id])
        void flush(id)
      })
    }

    window.addEventListener('pagehide', onHide)

    return () => window.removeEventListener('pagehide', onHide)
  }, [flush])

  return { engagements, loaded, status, update, create, remove }
}
