'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowUp, ArrowUpRight, CalendarDays, Mail, X } from 'lucide-react'

import { PROFILE } from '@/lib/portfolio'

import { BrandMark } from '@/components/landing/brand-mark'
import { DISPLAY_FONT, ICON_STROKE } from '@/components/landing/motion'

// `error` marks the fallback reply, so it can carry the email and booking
// links as buttons instead of leaving them buried in a sentence.
type Message = { id: number; role: 'user' | 'bot'; text: string; kind?: 'error' }

// Deliberately not a list of platform names: it went stale the moment a
// fourth one was added, and the answer is the same question either way.
const SUGGESTIONS = ['What can you automate for me?', 'Which platform should I use?', 'How much does a build cost?']

const GREETING =
  "Hi, I'm Ramon's assistant. Ask me about automation, the platforms I build on, or how an engagement works."

/**
 * Conversation key for the agent's memory window.
 *
 * The n8n agent keys its buffer on whatever it is handed, so a constant would
 * pool every visitor into one conversation and let them read fragments of each
 * other's. sessionStorage rather than localStorage: a returning visitor should
 * start fresh rather than resume a thread the agent no longer has context for,
 * since the memory window on the server side is finite.
 */
const SESSION_KEY = 'ramon-chat-session'

function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)

    if (existing) return existing

    const fresh = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

    sessionStorage.setItem(SESSION_KEY, fresh)

    return fresh
  } catch {
    // Private mode and blocked site data both throw on access. A per-call id
    // costs conversational memory but still keeps visitors out of each
    // other's threads, which is the part that matters.
    return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  }
}

/**
 * The route handler forwards to n8n server-side, so the instance URL never
 * reaches the browser and no CORS configuration is involved.
 */
async function sendMessage(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: sessionId() })
  })

  const data = (await res.json().catch(() => null)) as { reply?: string } | null

  if (!res.ok || !data?.reply) throw new Error(`chat failed: ${res.status}`)

  return data.reply
}

/** Dispatch on `window` to open the chat from anywhere on the page. */
export const OPEN_CHAT_EVENT = 'portfolio:open-chat'

/**
 * Whether the assistant answered its health check. `null` until it has, so
 * nothing is hidden on a guess. Module state plus an event rather than a
 * context provider: the widget mounts once at the layout level and the FAQ's
 * "Ask the assistant" box is the only other reader.
 */
const CHAT_STATUS_EVENT = 'portfolio:chat-status'
let chatAvailable: boolean | null = null

function publishAvailability(value: boolean) {
  chatAvailable = value
  window.dispatchEvent(new Event(CHAT_STATUS_EVENT))
}

export function useChatAvailable() {
  const [available, setAvailable] = useState<boolean | null>(chatAvailable)

  useEffect(() => {
    const sync = () => setAvailable(chatAvailable)

    sync()
    window.addEventListener(CHAT_STATUS_EVENT, sync)

    return () => window.removeEventListener(CHAT_STATUS_EVENT, sync)
  }, [])

  return available
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: 'bot', text: GREETING }])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)

  // Connection state is reported from what actually happened, never asserted
  // up front. "idle" until a real exchange proves it either way, so the header
  // cannot claim to be connected to a backend that is down.
  const [status, setStatus] = useState<'idle' | 'ok' | 'down'>('idle')

  const available = useChatAvailable()
  const offline = available === false

  // Phones: the launcher steps aside while the page moves, so it never sits on
  // top of the text being read, and returns once scrolling stops.
  const [scrolling, setScrolling] = useState(false)

  // While a Calendly calendar is on screen the launcher keeps off it: on
  // desktop the pill folds back to the mark, on phones it steps aside, since
  // even the bare mark would sit on the calendar's last column there.
  const [nearCalendar, setNearCalendar] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const nextId = useRef(1)

  // Closing hands focus back to the launcher. A frame later, because on phones
  // the launcher is hidden while the panel is open and cannot take focus yet.
  const restoreFocus = () => requestAnimationFrame(() => launcherRef.current?.focus())

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  // One health check per visit, after the page has settled. A failed check
  // hides the launcher: a chat that can only say it is unavailable is worse
  // than none, and the page's email links still work.
  useEffect(() => {
    if (chatAvailable !== null) return

    const timer = window.setTimeout(() => {
      fetch('/api/chat')
        .then(r => r.json())
        .then((d: { ok?: boolean }) => publishAvailability(d?.ok === true))
        .catch(() => publishAvailability(false))
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let timer = 0

    const onScroll = () => {
      setScrolling(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setScrolling(false), 700)
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const onScreen = new Set<Element>()

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target)
        else onScreen.delete(entry.target)
      }

      setNearCalendar(onScreen.size > 0)
    })

    const attach = () => document.querySelectorAll('.calendly-frame').forEach(frame => observer.observe(frame))

    // /contact mounts its calendar one render after the page (it first checks
    // the URL for a picked slot), so look again shortly after.
    attach()
    const retry = window.setTimeout(attach, 1000)

    return () => {
      window.clearTimeout(retry)
      observer.disconnect()
    }
  }, [])

  // Other parts of the page (the FAQ's "Ask the assistant") open the chat by
  // event rather than by prop, so the widget stays self-contained.
  useEffect(() => {
    const openChat = () => setOpen(true)

    window.addEventListener(OPEN_CHAT_EVENT, openChat)

    return () => window.removeEventListener(OPEN_CHAT_EVENT, openChat)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return

      setOpen(false)
      requestAnimationFrame(() => launcherRef.current?.focus())
    }

    document.addEventListener('keydown', onKey)

    // Offline there is no input to type into, so focus lands on the close button.
    ;(offline ? closeRef : inputRef).current?.focus()

    return () => document.removeEventListener('keydown', onKey)
  }, [open, offline])

  const submit = async (text: string) => {
    const value = text.trim()

    if (!value || pending) return

    const mine: Message = { id: nextId.current++, role: 'user', text: value }

    setMessages(prev => [...prev, mine])
    setDraft('')
    setPending(true)

    try {
      const reply = await sendMessage(value)

      setStatus('ok')
      setMessages(prev => [...prev, { id: nextId.current++, role: 'bot', text: reply }])
    } catch {
      setStatus('down')
      setMessages(prev => [
        ...prev,
        {
          id: nextId.current++,
          role: 'bot',
          kind: 'error',
          text: `I can't reach my backend right now. Email ${PROFILE.email} or book a free call from the contact section and Ramon will pick it up directly.`
        }
      ])
    } finally {
      setPending(false)
    }
  }

  const fresh = messages.length === 1 && !offline
  const labelled = !open && !nearCalendar

  return (
    <>
      {/* Launcher. Always shown: when the health check fails, the panel offers
          email and a call instead of a dead chat, rather than the icon simply
          vanishing (it did, and read as a broken page). On phones it steps out
          of the way while the panel is open, since the panel has its own close. */}
      <button
        ref={launcherRef}
        type='button'
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls='chat-panel'
        aria-label={open ? 'Close chat' : "Ask about automation, chat with Ramon's assistant"}
        className={`chat-launcher bg-ink text-ground fixed right-4 bottom-4 z-[110] flex h-12 items-center gap-2.5 rounded-full p-1.5 transition-[transform,opacity] duration-300 hover:-translate-y-0.5 active:scale-95 sm:right-5 sm:bottom-5 sm:h-14 sm:p-[7px] ${
          open ? 'max-sm:hidden' : ''
        } ${labelled ? 'sm:pr-5' : ''} ${
          (scrolling || nearCalendar) && !open
            ? 'max-sm:pointer-events-none max-sm:translate-y-20 max-sm:opacity-0'
            : ''
        }`}
      >
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] sm:h-[42px] sm:w-[42px]'>
          {open ? (
            <X size={20} strokeWidth={ICON_STROKE} aria-hidden='true' />
          ) : (
            <BrandMark className='chat-mark h-[22px] w-[22px] sm:h-[26px] sm:w-[26px]' />
          )}
        </span>
        {labelled && <span className='hidden text-[14.5px] font-medium sm:inline'>Ask about automation</span>}
      </button>

      {/* Panel. A floating card on desktop, a sheet below the nav on phones. */}
      <div
        id='chat-panel'
        role='dialog'
        aria-label="Chat with Ramon's assistant"
        hidden={!open}
        className='chat-panel fixed z-[110] flex flex-col overflow-hidden rounded-[22px] max-sm:inset-x-2 max-sm:top-24 max-sm:bottom-2 sm:right-5 sm:bottom-24 sm:h-[min(610px,calc(100dvh-8rem))] sm:w-[404px]'
      >
        {/* Header */}
        <div className='flex items-center gap-3 py-3.5 pr-3.5 pl-5'>
          <BrandMark className='chat-mark-header h-7 w-7 shrink-0' />
          <div className='min-w-0'>
            <p className='text-ink text-[14.5px] font-medium' style={{ fontFamily: DISPLAY_FONT }}>
              Ramon&apos;s assistant <span className='text-ink-4 ml-0.5 text-[12px] font-normal'>AI</span>
            </p>
            <p className='text-ink-3 mt-0.5 flex items-center gap-1.5 text-[12px]'>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'ok' ? 'bg-emerald-500' : status === 'down' || offline ? 'bg-amber-500' : 'bg-ink/25'
                }`}
              />
              {status === 'ok'
                ? 'Connected'
                : offline
                  ? 'Assistant offline'
                  : status === 'down'
                    ? 'Assistant unavailable'
                    : 'Usually replies in seconds'}
            </p>
          </div>
          <button
            ref={closeRef}
            type='button'
            onClick={() => {
              setOpen(false)
              restoreFocus()
            }}
            aria-label='Close chat'
            className='text-ink-3 hover:bg-ink/5 hover:text-ink ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors'
          >
            <X size={16} strokeWidth={ICON_STROKE} aria-hidden='true' />
          </button>
        </div>

        {/* Offline: the health check failed, so offer the two ways that do
            not depend on the assistant instead of a chat that cannot answer. */}
        {offline && (
          <>
            <div className='flex-1 px-6 pt-5'>
              <h2
                className='text-ink text-[26px] leading-[1.1] font-medium tracking-[-0.025em]'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                The assistant is offline right now.
              </h2>
              <p className='text-ink-3 mt-3 text-[14px] leading-relaxed'>
                You can still reach me directly by email or by booking a call.
              </p>
            </div>
            <div className='px-3 pb-3'>
              <a href={`mailto:${PROFILE.email}`} className='chat-row group'>
                <Mail size={16} strokeWidth={ICON_STROKE} className='text-accent' aria-hidden='true' />
                Email Ramon
                <ArrowUpRight size={16} strokeWidth={ICON_STROKE} className='chat-row-arrow' aria-hidden='true' />
              </a>
              <a href='#contact' onClick={() => setOpen(false)} className='chat-row group'>
                <CalendarDays size={16} strokeWidth={ICON_STROKE} className='text-accent' aria-hidden='true' />
                Book a free call
                <ArrowUpRight size={16} strokeWidth={ICON_STROKE} className='chat-row-arrow' aria-hidden='true' />
              </a>
            </div>
          </>
        )}

        {/* Thread. Untouched, it opens on a question rather than a lone bubble;
            once a message is sent it reads as a transcript. */}
        <div
          ref={listRef}
          role='log'
          aria-label='Conversation'
          className='chat-scroll flex-1 overflow-y-auto'
          hidden={offline}
        >
          {fresh ? (
            <div className='px-6 pt-5 pb-4'>
              <h2
                className='text-ink text-[28px] leading-[1.08] font-medium tracking-[-0.025em]'
                style={{ fontFamily: DISPLAY_FONT }}
              >
                What should come off your desk?
              </h2>
              <p className='text-ink-3 mt-3 text-[14px] leading-relaxed'>{GREETING}</p>
            </div>
          ) : (
            <ol className='space-y-5 px-6 pt-3 pb-5'>
              {messages.map(m => (
                <li key={m.id} className='chat-turn'>
                  <p className='text-ink-4 mb-1 text-[12px]'>{m.role === 'user' ? 'You' : 'Assistant'}</p>
                  <p
                    className={`text-[14.5px] leading-[1.6] whitespace-pre-line ${
                      m.role === 'user' ? 'text-ink font-medium' : 'text-ink-2'
                    }`}
                  >
                    {m.text}
                  </p>
                  {m.kind === 'error' && (
                    <div className='mt-3 flex flex-wrap gap-2'>
                      <a href={`mailto:${PROFILE.email}`} className='chat-chip'>
                        <Mail size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                        Email Ramon
                      </a>
                      <a href='#contact' onClick={() => setOpen(false)} className='chat-chip'>
                        <CalendarDays size={13} strokeWidth={ICON_STROKE} aria-hidden='true' />
                        Book a free call
                      </a>
                    </div>
                  )}
                </li>
              ))}

              {/* Waiting on n8n, drawn as a three-node workflow running. */}
              {pending && (
                <li className='chat-turn'>
                  <p className='text-ink-4 mb-2 text-[12px]'>Assistant</p>
                  <div className='flex items-center gap-3'>
                    <span className='chat-run' aria-hidden='true'>
                      <i />
                      <b />
                      <i />
                      <b />
                      <i />
                    </span>
                    <span className='text-ink-3 text-[12.5px]'>Working on it</span>
                  </div>
                </li>
              )}
            </ol>
          )}
        </div>

        {/* Suggestions, only while the thread is untouched */}
        {fresh && (
          <div className='px-3 pb-1'>
            {SUGGESTIONS.map(s => (
              <button key={s} type='button' onClick={() => submit(s)} className='chat-row group'>
                <span className='bg-accent h-1.5 w-1.5 shrink-0 rounded-full' />
                {s}
                <ArrowUpRight size={16} strokeWidth={ICON_STROKE} className='chat-row-arrow' aria-hidden='true' />
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          hidden={offline}
          onSubmit={e => {
            e.preventDefault()
            submit(draft)
          }}
          className='px-3 pt-1.5 pb-3'
        >
          <div className='chat-composer flex items-center gap-2 rounded-2xl bg-white py-[7px] pr-[7px] pl-4'>
            <label htmlFor='chat-input' className='sr-only'>
              Message
            </label>
            {/* 16px on phones: iOS zooms the page into any smaller input. */}
            <input
              id='chat-input'
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder='Ask a question…'
              autoComplete='off'
              className='text-ink placeholder:text-ink-4 min-w-0 flex-1 bg-transparent text-base focus:outline-none sm:text-[14px]'
            />
            <button
              type='submit'
              disabled={!draft.trim() || pending}
              aria-label='Send message'
              className='bg-ink text-ground hover:bg-ink/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition-opacity disabled:opacity-25'
            >
              <ArrowUp size={17} strokeWidth={ICON_STROKE} aria-hidden='true' />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
