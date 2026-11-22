'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

import { GuideDialog, GuidesView } from '@/components/dashboard/guides'
import { DashboardMark } from '@/components/dashboard/mark'
import { phaseStats, PlaybookView } from '@/components/dashboard/playbook-view'
import { TemplatesView } from '@/components/dashboard/templates-view'
import { ToolsView } from '@/components/dashboard/tools'
import { useEngagements } from '@/components/dashboard/use-engagements'
import { GUIDES, PHASES, type Opportunity, type RoiInputs, type ToolKey } from '@/lib/playbook'
import { getSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const VIEWS = ['playbook', 'guides', 'tools', 'templates'] as const

type View = (typeof VIEWS)[number]

const VIEW_LABEL: Record<View, string> = {
  playbook: 'Playbook',
  guides: 'Guides',
  tools: 'Tools',
  templates: 'Templates'
}

/** Remembered per browser: which client and phase were open last. */
const UI_KEY = 'rvd-dashboard-ui'

function readUi(): { client?: string; phase?: string } {
  try {
    return JSON.parse(localStorage.getItem(UI_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeUi(value: { client?: string | null; phase?: string }) {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(value))
  } catch {
    // Private mode or blocked storage: the dashboard works, it just won't remember.
  }
}

type Scratch = { checks: Record<string, boolean>; opps: Opportunity[]; roi: Partial<RoiInputs> }

/**
 * The private client dashboard: the seven-phase playbook with per-client
 * checklists, the guides, the Opportunity Matrix and ROI calculator, and the
 * Drive templates.
 *
 * Signed-out visitors are sent to /login. That redirect is a convenience, not
 * the protection: with no session, Supabase's row-level security returns no
 * rows, so there is nothing to show even if the redirect were bypassed.
 */
export function Dashboard() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabase(), [])
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!supabase) {
      router.replace('/login')

      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) router.replace('/login')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) router.replace('/login')
    })

    return () => sub.subscription.unsubscribe()
  }, [supabase, router])

  if (!session) {
    return (
      <div className='rvd-center' role='status'>
        {session === undefined ? 'Checking your session…' : 'Redirecting to login…'}
      </div>
    )
  }

  return <DashboardShell email={session.user.email ?? ''} />
}

function DashboardShell({ email }: { email: string }) {
  const supabase = useMemo(() => getSupabase(), [])
  const { engagements, loaded, status, update, create, remove } = useEngagements(supabase, true)

  // This shell only ever renders in the browser (Dashboard shows a loading
  // line until the session check resolves), so reading the hash and storage
  // in the initial state cannot cause a hydration mismatch.
  const [view, setView] = useState<View>(() => {
    const hash = window.location.hash.slice(1)

    return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : 'playbook'
  })

  const [phaseId, setPhaseId] = useState(() => {
    const saved = readUi().phase

    return saved && PHASES.some(p => p.id === saved) ? saved : PHASES[0].id
  })

  const [chosenClientId, setClientId] = useState<string | null>(() => readUi().client ?? null)
  const [guideId, setGuideId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newClient, setNewClient] = useState('')
  const [newProject, setNewProject] = useState('')
  const [scratch, setScratch] = useState<Scratch>({ checks: {}, opps: [], roi: {} })

  // Falls back to the first client when the remembered one is gone.
  const clientId = engagements.some(e => e.id === chosenClientId) ? chosenClientId : (engagements[0]?.id ?? null)

  useEffect(() => {
    if (loaded) writeUi({ client: clientId, phase: phaseId })
  }, [loaded, clientId, phaseId])

  const current = engagements.find(e => e.id === clientId) ?? null
  const checks = current?.checks ?? scratch.checks
  const opps = current?.opps ?? scratch.opps
  const roi = current?.roi ?? scratch.roi

  const patch = (fields: Partial<Scratch>) => {
    if (current) update(current.id, fields)
    else setScratch(s => ({ ...s, ...fields }))
  }

  const showView = (next: View) => {
    setView(next)
    window.history.replaceState(null, '', `#${next}`)
  }

  const goTool = (key: ToolKey) => {
    setGuideId(null)
    showView('tools')
    setTimeout(() => document.getElementById(`rvd-tool-${key}`)?.scrollIntoView({ behavior: 'smooth' }), 40)
  }

  const goPhase = (id: string) => {
    setGuideId(null)
    setPhaseId(id)
    showView('playbook')
  }

  const onAdd = async (event: FormEvent) => {
    event.preventDefault()
    const name = newClient.trim()

    if (!name) return

    const id = await create(name, newProject.trim())

    if (id) {
      setClientId(id)
      setNewClient('')
      setNewProject('')
      setAdding(false)
    }
  }

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  let done = 0
  let total = 0

  PHASES.forEach(p => {
    const [d, t] = phaseStats(p, checks)

    done += d
    total += t
  })

  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <>
      <header className='rvd-top'>
        <div className='rvd-wrap rvd-top-row'>
          <a className='rvd-brand' href='/'>
            <DashboardMark />
            <div>
              <b>Ramon Vallejera Jr.</b>
              <span>Client dashboard</span>
            </div>
          </a>
          <div className='rvd-who'>
            <span>{email}</span>
            <button className='rvd-btn sm' type='button' onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
        <div className='rvd-wrap'>
          <nav className='rvd-tabs' aria-label='Sections'>
            {VIEWS.map(v => (
              <button key={v} type='button' aria-current={v === view ? 'page' : undefined} onClick={() => showView(v)}>
                {VIEW_LABEL[v]}
                {v === 'guides' && <span className='count'>{GUIDES.length}</span>}
                {v === 'templates' && <span className='count'>20</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className='rvd-wrap'>
        <div className='rvd-engbar'>
          <label className='rvd-lbl' htmlFor='rvd-client'>
            Client
          </label>
          <select
            id='rvd-client'
            value={clientId ?? ''}
            disabled={!engagements.length}
            onChange={e => {
              setClientId(e.target.value || null)
              setConfirmDelete(false)
            }}
          >
            {!engagements.length && <option value=''>{loaded ? 'No clients yet' : 'Loading…'}</option>}
            {engagements.map(e => (
              <option key={e.id} value={e.id}>
                {e.client}
                {e.project ? ` · ${e.project}` : ''}
              </option>
            ))}
          </select>
          <button className='rvd-btn sm' type='button' onClick={() => setAdding(a => !a)}>
            + New client
          </button>
          <div className='rvd-meter'>
            <div className='bar'>
              <i style={{ width: `${pct}%` }} />
            </div>
            <span className='pct'>
              {done}/{total} · {pct}%
            </span>
          </div>
          <span className={cn('rvd-status', status.error && 'err')} role='status'>
            {status.text}
          </span>
          {current && !confirmDelete && (
            <button className='rvd-btn sm ghost danger' type='button' onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          )}

          {adding && (
            <form className='rvd-newform' onSubmit={onAdd}>
              <input
                id='rvd-new-client'
                placeholder='Client company'
                aria-label='Client company'
                autoComplete='off'
                required
                autoFocus
                value={newClient}
                onChange={e => setNewClient(e.target.value)}
              />
              <input
                id='rvd-new-project'
                placeholder='Project (e.g. Invoice processing)'
                aria-label='Project'
                autoComplete='off'
                value={newProject}
                onChange={e => setNewProject(e.target.value)}
              />
              <button className='rvd-btn primary sm' type='submit'>
                Start engagement
              </button>
              <button className='rvd-btn sm ghost' type='button' onClick={() => setAdding(false)}>
                Cancel
              </button>
            </form>
          )}

          {current && confirmDelete && (
            <div className='rvd-confirm'>
              <span>
                Delete {current.client} and its checklist, matrix and ROI numbers? This can&rsquo;t be undone.
              </span>
              <button
                className='rvd-btn sm accent'
                type='button'
                onClick={() => {
                  setConfirmDelete(false)
                  void remove(current.id)
                }}
              >
                Delete
              </button>
              <button className='rvd-btn sm ghost' type='button' onClick={() => setConfirmDelete(false)}>
                Keep
              </button>
            </div>
          )}
        </div>

        {view === 'playbook' && (
          <PlaybookView
            phaseId={phaseId}
            onPhase={setPhaseId}
            checks={checks}
            onCheck={(id, value) => patch({ checks: { ...checks, [id]: value } })}
            clientName={current?.client ?? null}
            openGuide={setGuideId}
            goTool={goTool}
          />
        )}
        {view === 'guides' && <GuidesView openGuide={setGuideId} />}
        {view === 'tools' && (
          <ToolsView
            clientName={current?.client ?? null}
            opps={opps}
            onOpps={next => patch({ opps: next })}
            roi={roi}
            onRoi={next => patch({ roi: next })}
          />
        )}
        {view === 'templates' && <TemplatesView />}
      </main>

      <GuideDialog guideId={guideId} onClose={() => setGuideId(null)} goTool={goTool} goPhase={goPhase} />
    </>
  )
}
